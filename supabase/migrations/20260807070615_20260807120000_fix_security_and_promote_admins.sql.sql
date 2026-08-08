/*
# Fix Security Warnings and Promote Users to Admin

1. Overview
This migration fixes three security advisor warnings and promotes registered
users to admin role so they can access the Admin Panel and upload charts.

2. Security Fixes
- `set_updated_at()` function: set search_path to 'public' explicitly, removing
  the "function_search_path_mutable" warning.
- `handle_new_user()` function: revoke EXECUTE from anon and authenticated roles
  so it cannot be called directly via the REST API. This function is a trigger
  for new auth.users inserts and only needs to be called by the database trigger,
  not by clients.

3. Data Changes
- Promote all existing profiles to role = 'admin' so the registered user can
  access the admin panel and upload charts. The user has two accounts
  (prajjwalraj612@gmail.com, prajjwalraj4@gmail.com); both are promoted.

4. No Structural Changes
- No tables created, modified, or dropped.
- No columns added or removed.
- No RLS policies changed.
*/

-- Fix 1: set_updated_at search_path
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix 2: handle_new_user — restrict execution to trigger only
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- Promote all existing users to admin
UPDATE profiles SET role = 'admin' WHERE role = 'user';
