-- Advisor fixes: trigger function must not be callable via RPC; visitors don't need is_admin().
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
