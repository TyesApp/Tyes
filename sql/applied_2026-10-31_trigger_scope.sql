-- Clamp only app users (anon/authenticated). Direct SQL (dashboard) and the
-- service role pass through untouched.
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.role() IN ('anon','authenticated') AND NOT public.check_is_admin() THEN
    NEW.role   := OLD.role;
    NEW.status := OLD.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.protect_order_money()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.role() IN ('anon','authenticated') AND NOT public.check_is_admin() THEN
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

CREATE OR REPLACE FUNCTION public.protect_strategy_request()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.role() IN ('anon','authenticated') AND NOT public.check_is_admin() THEN
    NEW.status            := OLD.status;
    NEW.delivered_pdf_url := OLD.delivered_pdf_url;
    NEW.assigned_to       := OLD.assigned_to;
    NEW.user_id           := OLD.user_id;
    NEW.order_id          := OLD.order_id;
  END IF;
  RETURN NEW;
END;
$$;
