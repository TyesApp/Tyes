-- Owners may update their own orders (needed by the revision flow),
-- but the trigger below locks the money fields.
DROP POLICY IF EXISTS "orders_update_own" ON public.orders;
CREATE POLICY "orders_update_own" ON public.orders
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.protect_order_money()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' AND NOT public.check_is_admin() THEN
    IF (TG_OP = 'INSERT') THEN
      NEW.status := 'pending';
      IF NEW.attachments IS NOT NULL AND NEW.attachments ? 'payment_status'
         AND NEW.attachments->>'payment_status' IN ('paid','completed','succeeded','free') THEN
        NEW.attachments := jsonb_set(NEW.attachments, '{payment_status}', '"unpaid"');
      END IF;
    ELSE
      NEW.revenue := OLD.revenue;
      NEW.user_id := OLD.user_id;
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
      IF OLD.status IN ('paid','completed','delivered') AND NEW.status NOT IN ('paid','completed','delivered','revision') THEN
        NEW.status := OLD.status;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_protect_order_money ON public.orders;
CREATE TRIGGER trg_protect_order_money
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.protect_order_money();
