-- Align seeded setting values with the shapes the admin Settings screen edits.
update public.site_settings set value = '{"url": ""}' where key in ('brand.logo','brand.favicon');
update public.site_settings set value = '{"address": {"ar": "", "en": ""}}' where key = 'contact.address';
update public.site_settings set value = '{"about": {"ar": "", "en": ""}, "copyright": {"ar": "", "en": ""}}' where key = 'footer.content';
update public.site_settings set value = '{"title": {"ar": "", "en": ""}, "description": {"ar": "", "en": ""}, "og_image": ""}' where key = 'seo.defaults';
