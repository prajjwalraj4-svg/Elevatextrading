/*
# Fix handle_new_user EXECUTE permission

1. Overview
The previous migration revoked EXECUTE from anon and authenticated, but
PostgreSQL grants EXECUTE to the implicit `public` role by default for
functions. Since `public` includes all roles, the advisor still flags
the function as callable by anon and authenticated.

2. Fix
- Revoke EXECUTE from `public` on `handle_new_user()`.
- The function is a SECURITY DEFINER trigger function that auto-creates
  a profile row when a new auth.users record is inserted. It only needs
  to run as a trigger, not via the REST API.
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public;
