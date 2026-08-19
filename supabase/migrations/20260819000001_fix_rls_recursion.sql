-- =====================================================
-- FIX: Infinite recursion in RLS policies
-- Run this in Supabase SQL Editor for project:
-- https://supabase.com/dashboard/project/mqgsbidfsiuzechykjmk/sql/new
-- =====================================================

-- ROOT CAUSE: "Super admins can read all user records" policy on public.users
-- queries public.users inside itself → PostgREST infinite recursion when
-- any table with a policy that references users (like clubs) is queried.

-- STEP 1: Drop the recursive policy on users
DROP POLICY IF EXISTS "Super admins can read all user records" ON public.users;

-- STEP 2: Replace with a security definer function to break the recursion
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role::TEXT FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- STEP 3: Re-add the super admin policy using the function (no recursion)
CREATE POLICY "Super admins can read all user records" ON public.users
  FOR SELECT USING (
    auth.uid() = id OR public.get_my_role() = 'super_admin'
  );

-- STEP 4: Fix other recursive super-admin policies using same function
DROP POLICY IF EXISTS "Super admins full access to clubs" ON public.clubs;
CREATE POLICY "Super admins full access to clubs" ON public.clubs
  FOR ALL USING (
    verification_status = 'verified'
    OR auth.uid() IS NOT NULL
    OR public.get_my_role() = 'super_admin'
  );

DROP POLICY IF EXISTS "Super admins manage verification requests" ON public.club_verification_requests;
CREATE POLICY "Super admins manage verification requests" ON public.club_verification_requests
  FOR ALL USING (
    public.get_my_role() = 'super_admin'
    OR EXISTS (
      SELECT 1 FROM public.club_members
      WHERE club_id = public.club_verification_requests.club_id
      AND user_id = auth.uid()
    )
  );

-- STEP 5: Reload PostgREST schema cache

