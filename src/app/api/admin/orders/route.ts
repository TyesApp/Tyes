import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminUser, signQuote } from '@/utils/auth/admin';

// This route uses SERVICE_ROLE key, bypassing RLS entirely
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FORBIDDEN = () => NextResponse.json({ error: 'Forbidden' }, { status: 403 });

// Columns an admin may change from the dashboard (never id / user_id / created_at)
const ALLOWED_FIELDS = new Set([
  'status', 'revenue', 'attachments', 'items', 'progress', 'revisions', 'max_revisions',
  'title', 'plan', 'images_count', 'category', 'brief_description', 'selected_styles',
  'reference_images', 'font_label_files', 'customer_name', 'customer_email', 'admin_notes', 'notes',
  'documents', 'vat_rate', 'vat_mode', 'vat_country', 'vat_number',
]);

export async function PATCH(request: Request) {
  try {
    if (!(await getAdminUser())) return FORBIDDEN();
    const body = await request.json();
    const { orderId, updates } = body;

    if (!orderId || !updates) {
      return NextResponse.json({ error: 'Missing orderId or updates' }, { status: 400 });
    }

    const safeUpdates: Record<string, any> = {};
    for (const [k, v] of Object.entries(updates || {})) {
      if (ALLOWED_FIELDS.has(k)) safeUpdates[k] = v;
    }
    if ('revenue' in safeUpdates) {
      // 2-decimal clamp so the stored value and the signed value never diverge
      safeUpdates.revenue = Math.round((Number(safeUpdates.revenue) || 0) * 100) / 100;
    }

    // Keep / create the signature that proves a Custom quote price was set by an admin
    if ('revenue' in safeUpdates || 'attachments' in safeUpdates) {
      const { data: current } = await supabaseAdmin.from('orders').select('revenue, attachments').eq('id', orderId).maybeSingle();
      const attachments = { ...(current?.attachments || {}), ...(safeUpdates.attachments || {}) };
      if ('revenue' in safeUpdates) {
        attachments.quote_sig = signQuote(orderId, Number(safeUpdates.revenue) || 0);
      } else if (current?.attachments?.quote_sig) {
        attachments.quote_sig = current.attachments.quote_sig;
      } else {
        delete attachments.quote_sig;
      }
      safeUpdates.attachments = attachments;
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(safeUpdates)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('[Admin Order Update] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('[Admin Order Update] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await getAdminUser())) return FORBIDDEN();
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order id' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
