import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sendOrderConfirmationEmail } from '@/utils/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error: any) {
    console.error(`Webhook signature verification failed: ${error.message}`);
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    // Never mark an order paid for less than the server-side price of the session.
    const expectedNetCents = Number(session.metadata?.expectedNetCents || 0);
    if (expectedNetCents > 0 && (session.amount_subtotal ?? 0) < expectedNetCents) {
      console.error(`Underpaid session for order ${orderId}: ${session.amount_subtotal} < ${expectedNetCents}`);
      return NextResponse.json({ received: true, ignored: 'underpaid' });
    }

    if (orderId) {
      console.log(`Processing successful payment for Order: ${orderId}`);

      let invoiceUrl = '';
      let invoiceId = '';

      // If Stripe generated an invoice, fetch it to get the hosted URL
      if (session.invoice) {
        try {
          const invoice = await stripe.invoices.retrieve(session.invoice as string);
          invoiceUrl = invoice.hosted_invoice_url || '';
          invoiceId = invoice.id;
        } catch (invErr) {
          console.error('Error fetching Stripe invoice:', invErr);
        }
      }
      
      // First, get the current order to access attachments
      const { data: currentOrder } = await supabase
        .from('orders')
        .select('attachments, status')
        .eq('id', orderId)
        .single();

      if (!currentOrder) {
        console.error('Webhook: order not found', orderId);
        return NextResponse.json({ received: true, ignored: 'order_not_found' });
      }

      const updatedAttachments = { ...(currentOrder.attachments || {}) };
      updatedAttachments.payment_status = 'paid';

      // Idempotent transition: only the FIRST confirmation (webhook or
      // verify-session) flips the order and runs the side effects below.
      // Stripe retries and the client-side race are no-ops.
      const { data: wonRows, error } = await supabase
        .from('orders')
        .update({ status: 'paid', attachments: updatedAttachments })
        .eq('id', orderId)
        .in('status', ['pending', 'in_progress', 'quote_sent'])
        .select();

      if (error) {
         console.error('Error updating supabase order:', error);
         return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }
      if (!wonRows || wonRows.length === 0) {
        // Already processed (or being processed) elsewhere.
        return NextResponse.json({ received: true, alreadyProcessed: true });
      }
      const order = wonRows[0];

      // Handle brand_strategy_requests for this order
      const { data: existingRequest } = await supabase
        .from('brand_strategy_requests')
        .select('id, status')
        .eq('order_id', orderId)
        .single();

      if (existingRequest) {
        if (existingRequest.status === 'pending' || existingRequest.status === 'new') {
          await supabase
            .from('brand_strategy_requests')
            .update({ status: 'new', assigned_to: 'Raluca' })
            .eq('id', existingRequest.id);
        }
      } else {
        const plan = order.plan || '';
        const hasStrategyAddon = order.attachments?.has_strategy_addon;
        const needsStrategy = plan.includes('Campaign 5') || plan.includes('Campaign 10') || plan.includes('Custom') || plan === 'Brand Strategy' || hasStrategyAddon;
        
        if (needsStrategy) {
          await supabase.from('brand_strategy_requests').insert([{
             user_id: order.user_id,
             order_id: orderId,
             status: 'new',
             brand_data: { brandName: order.customer_name || 'Unknown', category: 'N/A' },
             source: plan === 'Brand Strategy' ? 'Standalone Request' : (hasStrategyAddon ? 'Order Add-on' : 'included'),
             tier: plan,
             assigned_to: 'Raluca',
             created_at: new Date().toISOString()
          }]);
        }
      }

      // Save the invoice to the invoices table (skip if already recorded)
      if (invoiceUrl && invoiceId) {
        const { data: existingInv } = await supabase
          .from('invoices')
          .select('id')
          .eq('stripe_invoice_id', invoiceId)
          .limit(1)
          .maybeSingle();
        if (existingInv) {
          return NextResponse.json({ received: true });
        }
        const { error: invError } = await supabase.from('invoices').insert([{
          order_id: order.id,
          user_id: order.user_id,
          amount: session.amount_total ? session.amount_total / 100 : order.revenue,
          status: 'paid',
          due_date: new Date().toISOString().split('T')[0],
          invoice_url: invoiceUrl,
          stripe_invoice_id: invoiceId,
        }]);
        if (invError) console.error('Error saving invoice to DB:', invError);
      }

      // Send Order Confirmation Email
      let clientEmail = order.customer_email || session.customer_details?.email || '';
      if (!clientEmail) {
        const { data: profile } = await supabase.from('profiles').select('email, billing_email').eq('id', order.user_id).single();
        if (profile) clientEmail = profile.billing_email || profile.email;
      }

      if (clientEmail) {
        await sendOrderConfirmationEmail({
          to: clientEmail,
          customerName: order.customer_name || session.customer_details?.name || 'Client',
          orderTitle: order.title,
          planName: order.plan,
          price: order.revenue, // Base price
          orderId: order.id,
          invoiceUrl: invoiceUrl, // This points to the Stripe Hosted Invoice
          taxAmount: session.total_details?.amount_tax ? session.total_details.amount_tax / 100 : 0,
          totalAmount: session.amount_total ? session.amount_total / 100 : order.revenue,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
