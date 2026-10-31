-- pricing_plans: anyone may read, only admins may change prices
DROP POLICY IF EXISTS "Full access for authenticated users" ON public.pricing_plans;
DROP POLICY IF EXISTS "pricing_plans_read_all" ON public.pricing_plans;
CREATE POLICY "pricing_plans_read_all" ON public.pricing_plans
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "pricing_plans_admin_write" ON public.pricing_plans;
CREATE POLICY "pricing_plans_admin_write" ON public.pricing_plans
  FOR ALL TO authenticated
  USING (public.check_is_admin()) WITH CHECK (public.check_is_admin());

-- revision_requests: only your own orders' requests (admins see all)
DROP POLICY IF EXISTS "Users can view their own revision requests" ON public.revision_requests;
DROP POLICY IF EXISTS "Users can insert their own revision requests" ON public.revision_requests;
DROP POLICY IF EXISTS "revreq_select_own_or_admin" ON public.revision_requests;
CREATE POLICY "revreq_select_own_or_admin" ON public.revision_requests
  FOR SELECT TO authenticated
  USING (public.check_is_admin() OR EXISTS (
    SELECT 1 FROM public.orders o WHERE o.id = revision_requests.order_id AND o.user_id = auth.uid()
  ));
DROP POLICY IF EXISTS "revreq_insert_own" ON public.revision_requests;
CREATE POLICY "revreq_insert_own" ON public.revision_requests
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders o WHERE o.id = revision_requests.order_id AND o.user_id = auth.uid()
  ));
