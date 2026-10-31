-- ════════════════════════════════════════════════════════════════════
-- TYES security hardening — run this in Supabase → SQL Editor
-- Safe to run more than once.
-- ════════════════════════════════════════════════════════════════════

-- 1. Nobody can change their own role/status in profiles.
--    Only the service role (used by the API) may change them.
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger AS $$
BEGIN
  IF (auth.role() IS DISTINCT FROM 'service_role') THEN
    NEW.role   := OLD.role;
    NEW.status := OLD.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

-- 2. New sign-ups are always plain clients, whatever the signup request claims.
--    (Adjust the function name if your project's handle_new_user differs —
--    check Database → Functions. This covers the common template.)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
    -- Force role='client' on the profile row created for new users.
    EXECUTE $f$
      CREATE OR REPLACE FUNCTION public.force_new_user_client()
      RETURNS trigger AS $t$
      BEGIN
        IF (auth.role() IS DISTINCT FROM 'service_role') THEN
          NEW.role := 'client';
        END IF;
        RETURN NEW;
      END;
      $t$ LANGUAGE plpgsql SECURITY DEFINER;
    $f$;
    DROP TRIGGER IF EXISTS trg_force_new_user_client ON public.profiles;
    CREATE TRIGGER trg_force_new_user_client
      BEFORE INSERT ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION public.force_new_user_client();
  END IF;
END $$;

-- 3. Orders: clients may not write payment/price fields themselves.
--    Inserts from the app keep working (status forced to 'pending',
--    payment_status cleaned); updates can no longer touch money fields.
CREATE OR REPLACE FUNCTION public.protect_order_money()
RETURNS trigger AS $$
BEGIN
  IF (auth.role() IS DISTINCT FROM 'service_role') THEN
    IF (TG_OP = 'INSERT') THEN
      NEW.status := 'pending';
      IF NEW.attachments ? 'payment_status'
         AND NEW.attachments->>'payment_status' IN ('paid','completed','succeeded','free') THEN
        NEW.attachments := jsonb_set(NEW.attachments, '{payment_status}', '"unpaid"');
      END IF;
    ELSE
      NEW.revenue := OLD.revenue;
      NEW.user_id := OLD.user_id;
      IF (OLD.attachments->>'payment_status') IS DISTINCT FROM (NEW.attachments->>'payment_status') THEN
        IF OLD.attachments ? 'payment_status' THEN
          NEW.attachments := jsonb_set(COALESCE(NEW.attachments,'{}'::jsonb), '{payment_status}',
                                       to_jsonb(OLD.attachments->>'payment_status'));
        ELSE
          NEW.attachments := COALESCE(NEW.attachments,'{}'::jsonb) - 'payment_status';
        END IF;
      END IF;
      IF OLD.attachments ? 'quote_sig' THEN
        NEW.attachments := jsonb_set(COALESCE(NEW.attachments,'{}'::jsonb), '{quote_sig}', OLD.attachments->'quote_sig');
      ELSE
        NEW.attachments := COALESCE(NEW.attachments,'{}'::jsonb) - 'quote_sig';
      END IF;
      -- Paid/placed orders cannot be re-marked by the client.
      IF OLD.status IN ('paid','completed','delivered') AND NEW.status NOT IN ('paid','completed','delivered','revision') THEN
        NEW.status := OLD.status;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_order_money ON public.orders;
CREATE TRIGGER trg_protect_order_money
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.protect_order_money();

-- 4. Strategy requests: owners may edit only their brand data, not the
--    delivery status or the delivered PDF link.
CREATE OR REPLACE FUNCTION public.protect_strategy_request()
RETURNS trigger AS $$
BEGIN
  IF (auth.role() IS DISTINCT FROM 'service_role') THEN
    IF (TG_OP = 'UPDATE') THEN
      NEW.status            := OLD.status;
      NEW.delivered_pdf_url := OLD.delivered_pdf_url;
      NEW.assigned_to       := OLD.assigned_to;
      NEW.user_id           := OLD.user_id;
      NEW.order_id          := OLD.order_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_strategy_request ON public.brand_strategy_requests;
CREATE TRIGGER trg_protect_strategy_request
  BEFORE UPDATE ON public.brand_strategy_requests
  FOR EACH ROW EXECUTE FUNCTION public.protect_strategy_request();
