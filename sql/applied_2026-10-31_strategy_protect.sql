CREATE OR REPLACE FUNCTION public.protect_strategy_request()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' AND NOT public.check_is_admin() THEN
    NEW.status            := OLD.status;
    NEW.delivered_pdf_url := OLD.delivered_pdf_url;
    NEW.assigned_to       := OLD.assigned_to;
    NEW.user_id           := OLD.user_id;
    NEW.order_id          := OLD.order_id;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_protect_strategy_request ON public.brand_strategy_requests;
CREATE TRIGGER trg_protect_strategy_request
  BEFORE UPDATE ON public.brand_strategy_requests
  FOR EACH ROW EXECUTE FUNCTION public.protect_strategy_request();
