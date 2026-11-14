-- About and Privacy page content lives in site_settings so it is editable from the dashboard.
insert into public.site_settings (key, value, is_public) values
  ('page.about',   '{"title": {"ar": "", "en": ""}, "body": {"ar": "", "en": ""}, "image": ""}', true),
  ('page.privacy', '{"title": {"ar": "", "en": ""}, "body": {"ar": "", "en": ""}}', true)
on conflict (key) do nothing;
