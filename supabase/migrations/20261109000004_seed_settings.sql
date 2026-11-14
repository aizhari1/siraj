-- Empty setting keys so the Global Settings screen has rows to edit. No client content is seeded.
insert into public.site_settings (key, value, is_public) values
  ('brand.logo',            '{"url": null}', true),
  ('brand.favicon',         '{"url": null}', true),
  ('brand.colors',          '{"background":"#0B0D10","surface":"#111318","card":"#171923","purple":"#8B5CF6","purple_light":"#A78BFA","muted":"#A1A1AA"}', true),
  ('contact.whatsapp',      '{"enabled": false, "number": "", "message_ar": "", "message_en": ""}', true),
  ('contact.email',         '{"value": ""}', true),
  ('contact.phone',         '{"value": ""}', true),
  ('contact.address',       '{"ar": "", "en": ""}', true),
  ('social.links',          '{"facebook":"","instagram":"","linkedin":"","tiktok":"","x":"","youtube":""}', true),
  ('footer.content',        '{"about_ar": "", "about_en": "", "copyright_ar": "", "copyright_en": ""}', true),
  ('seo.defaults',          '{"title_ar":"","title_en":"","description_ar":"","description_en":"","og_image":null}', true)
on conflict (key) do nothing;
