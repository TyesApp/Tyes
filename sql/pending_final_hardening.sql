-- ════════════════════════════════════════════════════════════════════
-- TYES final hardening — Supabase → SQL Editor → Run (safe to re-run)
-- 1) orders trigger v3: clients can't invent prices, can't self-promote
--    an order to paid/delivered, can't raise their revision limit
-- 2) 'pdfs' storage bucket becomes private, admin-write only
-- ════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.protect_order_money()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.role() IN ('anon','authenticated') AND NOT public.check_is_admin() THEN
    IF (TG_OP = 'INSERT') THEN
      NEW.status := 'pending';
      NEW.revenue := 0;  -- real price is set server-side at checkout
      IF NEW.attachments IS NOT NULL AND NEW.attachments ? 'payment_status'
         AND NEW.attachments->>'payment_status' IN ('paid','completed','succeeded','free') THEN
        NEW.attachments := jsonb_set(NEW.attachments, '{payment_status}', '"unpaid"');
      END IF;
      IF NEW.attachments IS NOT NULL AND NEW.attachments ? 'quote_sig' THEN
        NEW.attachments := NEW.attachments - 'quote_sig';
      END IF;
    ELSE
      NEW.revenue := OLD.revenue;
      NEW.user_id := OLD.user_id;
      NEW.max_revisions := OLD.max_revisions;
      IF (COALESCE(OLD.attachments,'{}'::jsonb)->>'payment_status') IS DISTINCT FROM (COALESCE(NEW.attachments,'{}'::jsonb)->>'payment_status') THEN
        IF COALESCE(OLD.attachments,'{}'::jsonb) ? 'payment_status' THEN
          NEW.attachments := jsonb_set(COALESCE(NEW.attachments,'{}'::jsonb), '{payment_status}',
                                       to_jsonb(OLD.attachments->>'payment_status'));
        ELSE
          NEW.attachments := COALESCE(NEW.attachments,'{}'::jsonb) - 'payment_status';
        END IF;
      END IF;
      IF COALESCE(OLD.attachments,'{}'::jsonb) ? 'quote_sig' THEN
        NEW.attachments := jsonb_set(COALESCE(NEW.attachments,'{}'::jsonb), '{quote_sig}', OLD.attachments->'quote_sig');
      ELSE
        NEW.attachments := COALESCE(NEW.attachments,'{}'::jsonb) - 'quote_sig';
      END IF;
      -- no self-demotion FROM paid states...
      IF OLD.status IN ('paid','completed','delivered') AND NEW.status NOT IN ('paid','completed','delivered','revision') THEN
        NEW.status := OLD.status;
      END IF;
      -- ...and no self-promotion INTO paid states (only Stripe/admin do that)
      IF NEW.status IN ('paid','completed','delivered') AND OLD.status NOT IN ('paid','completed','delivered') THEN
        NEW.status := OLD.status;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- ── pdfs bucket: private, admin-write, served only via signed URLs ──
UPDATE storage.buckets SET public = false WHERE id = 'pdfs';
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update Access" ON storage.objects;
DROP POLICY IF EXISTS "pdfs_admin_all" ON storage.objects;
CREATE POLICY "pdfs_admin_all" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'pdfs' AND public.check_is_admin())
  WITH CHECK (bucket_id = 'pdfs' AND public.check_is_admin());
