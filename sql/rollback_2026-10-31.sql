DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
DROP TRIGGER IF EXISTS trg_protect_order_money ON public.orders;
DROP TRIGGER IF EXISTS trg_protect_strategy_request ON public.brand_strategy_requests;
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_admin" ON public.profiles;
DROP POLICY IF EXISTS "orders_update_own" ON public.orders;
DROP POLICY IF EXISTS "pricing_plans_read_all" ON public.pricing_plans;
DROP POLICY IF EXISTS "pricing_plans_admin_write" ON public.pricing_plans;
CREATE POLICY "Full access for authenticated users" ON public.pricing_plans FOR ALL TO public USING (auth.role()='authenticated') WITH CHECK (auth.role()='authenticated');
DROP POLICY IF EXISTS "revreq_select_own_or_admin" ON public.revision_requests;
DROP POLICY IF EXISTS "revreq_insert_own" ON public.revision_requests;
CREATE POLICY "Users can view their own revision requests" ON public.revision_requests FOR SELECT TO public USING (true);
CREATE POLICY "Users can insert their own revision requests" ON public.revision_requests FOR INSERT TO public WITH CHECK (true);
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'role','client'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
