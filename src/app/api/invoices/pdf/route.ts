import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const admin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string
);

// GET /api/invoices/pdf?invoice=in_xxx → redirects to Stripe's official invoice PDF (download)
export async function GET(req: NextRequest) {
  const stripeInvoiceId = req.nextUrl.searchParams.get('invoice');
  if (!stripeInvoiceId || !stripeInvoiceId.startsWith('in_')) {
    return new NextResponse('Missing invoice id', { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse('Not signed in', { status: 401 });

  const { data: row } = await admin
    .from('invoices')
    .select('user_id')
    .eq('stripe_invoice_id', stripeInvoiceId)
    .maybeSingle();
  if (!row) return new NextResponse('Invoice not found', { status: 404 });

  if (row.user_id !== user.id) {
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle();
    const isAdmin = ['admin', 'superAdmin', 'super_admin'].includes(profile?.role);
    if (!isAdmin) return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    const invoice = await stripe.invoices.retrieve(stripeInvoiceId);
    const url = invoice.invoice_pdf || invoice.hosted_invoice_url;
    if (!url) return new NextResponse('PDF not available yet', { status: 404 });
    return NextResponse.redirect(url);
  } catch (e) {
    console.error('Invoice PDF error:', e);
    return new NextResponse('Could not load invoice', { status: 500 });
  }
}
