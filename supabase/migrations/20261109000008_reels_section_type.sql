-- Adds the "reels" section type (vertical video cards).
alter table public.sections drop constraint if exists sections_section_type_check;
alter table public.sections add constraint sections_section_type_check check (section_type in (
  'hero','text_image','services_grid','projects_grid','video_showcase','statistics',
  'testimonials','faq','logo_wall','process_timeline','cta','custom_content','reels'));
