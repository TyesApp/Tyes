import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { verifyQuote, isCustomOrder } from '@/utils/auth/admin';
import { createClient as createSessionClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { orderId, billingCountry, isInvoice } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 0. The caller must be signed in and must own the order.
    const sessionClient = await createSessionClient();
    const { data: { user: caller } } = await sessionClient.auth.getUser();
    if (!caller) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    if (order.user_id !== caller.id) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    if (order.status === 'paid' || order.attachments?.payment_status === 'paid') {
      return NextResponse.json({ error: 'Order is already paid' }, { status: 400 });
    }

    // 1b. The amount is decided on the server — never from the request body.
    let price: number;
    let planName: string;
    if (isCustomOrder(order)) {
      // Custom / Deep Dive: the price is the admin-set quote stored on the order.
      price = Number(order.revenue) || 0;
      planName = `Custom Quote: ${order.title || order.plan || 'Order'}`;
      const sig = order.attachments?.quote_sig;
      if (sig && !verifyQuote(orderId, price, sig)) {
        return NextResponse.json({ error: 'Quote is out of date — please contact support' }, { status: 409 });
      }
    } else {
      const { data: plan } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('name', order.plan)
        .maybeSingle();
      if (plan) {
        price = Number(plan.price) || 0;
        if (price === 0 && order.attachments?.has_strategy_addon && plan.strategy_addon_allowed) {
          price += Number(plan.strategy_addon_price) || 25;
        }
      } else {
        // Legacy plan no longer in pricing_plans: fall back to the stored amount,
        // honouring the admin quote signature when present.
        price = Number(order.revenue) || 0;
        const sig = order.attachments?.quote_sig;
        if (sig && !verifyQuote(orderId, price, sig)) {
          return NextResponse.json({ error: 'Quote is out of date — please contact support' }, { status: 409 });
        }
      }
      planName = order.plan || order.title || 'Tyes order';
    }
    if (!price || price <= 0) {
      return NextResponse.json({ error: 'This order has nothing to pay' }, { status: 400 });
    }

    // Keep the order's revenue in sync with what will actually be charged (net).
    if (Number(order.revenue) !== price) {
      await supabase.from('orders').update({ revenue: price }).eq('id', orderId);
    }

    const customerEmail = caller.email;
    const customerName = undefined;

    // 2. Fetch the user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', order.user_id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // 3. Determine the country to use (frontend selection or fallback)
    const { data: userAuth } = await supabase.auth.admin.getUserById(order.user_id);
    const fallbackCountry = userAuth?.user?.user_metadata?.country || 'RO';
    const selectedCountry = billingCountry || fallbackCountry;

    // 4. Get or create Stripe Customer (Mode-aware for both Test and Live environments)
    const isLive = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_');
    const customerIdKey = isLive ? 'stripe_customer_id_live' : 'stripe_customer_id_test';

    let stripeCustomerId = userAuth?.user?.user_metadata?.[customerIdKey] || userAuth?.user?.user_metadata?.stripe_customer_id;

    if (stripeCustomerId) {
      try {
        const existingCustomer = await stripe.customers.retrieve(stripeCustomerId);
        const custEmail = (existingCustomer as any).email?.toLowerCase?.() || '';
        if ((existingCustomer as any).deleted || (custEmail && custEmail !== (caller.email || '').toLowerCase())) {
          // Deleted, or the stored ID points at someone else's Stripe customer.
          stripeCustomerId = null;
        } else {
          await stripe.customers.update(stripeCustomerId, {
            address: { country: selectedCountry },
          });
        }
      } catch (err) {
        // If customer was created in test mode and now running in live mode (or vice versa)
        stripeCustomerId = null;
      }
    }

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: customerEmail || profile.email,
        name: customerName || `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        address: { country: selectedCountry },
      });
      
      stripeCustomerId = customer.id;

      // Update auth metadata with mode-specific and default Stripe Customer ID
      await supabase.auth.admin.updateUserById(order.user_id, {
        user_metadata: { 
          ...userAuth?.user?.user_metadata, 
          [customerIdKey]: stripeCustomerId,
          stripe_customer_id: stripeCustomerId 
        }
      });
    }

    // 5. Create Checkout Session with Stripe automatic_tax
    //    Stripe calculates VAT dynamically based on the customer's actual billing address.
    //    This means if the customer changes their country in checkout, the VAT updates automatically.
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: stripeCustomerId,
      tax_id_collection: { enabled: true },
      billing_address_collection: 'required',
      automatic_tax: { enabled: true },
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
      invoice_creation: {
        enabled: true,
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            // 'exclusive' = tax added on top of the price shown
            tax_behavior: 'exclusive',
            product_data: {
              name: planName,
              // Marketing & Design services tax code — Stripe Tax uses this to determine
              // the correct VAT/sales tax treatment per jurisdiction.
              tax_code: 'txcd_10103000',
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        orderId,
        expectedNetCents: String(Math.round(price * 100)),
      },
      success_url: `${req.headers.get('origin')}/dashboard/client?paid=1${isInvoice ? '&invoice_payment=1' : ''}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/dashboard/client?cancel=true`,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
