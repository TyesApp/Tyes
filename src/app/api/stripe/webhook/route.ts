import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Note: If Row Level Security (RLS) blocks anonymous/unauthenticated updates,
// you might need to supply process.env.SUPABASE_SERVICE_ROLE_KEY instead.
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
    
    if (orderId) {
      console.log(`Processing successful payment for Order: ${orderId}`);
      
      // We assume the title of the order matches orderId if ID was not fetched during insert.
      // Update the status of the order to 'paid' (or however you'd like to reflect success)
      const { error } = await supabase
        .from('orders')
        .update({ status: 'paid' }) 
        .eq('title', orderId); 
        
      if (error) {
         console.error('Error updating supabase order:', error);
         return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
