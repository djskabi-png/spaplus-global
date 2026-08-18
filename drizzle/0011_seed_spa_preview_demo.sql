INSERT OR IGNORE INTO spa_previews (
  slug, status, language, spa_name, address, about, hours, treatments,
  spa_package, logo_url, photo_urls, created_by, created_at, updated_at
) VALUES (
  'spaplus-profile-demo',
  'shared',
  'en',
  'SpaPlus Profile Demo',
  'Sample address, Toronto, Ontario',
  'This fictional profile demonstrates how a prospective spa can appear on SpaPlus. All business information, services, prices and images on this page are illustrative and do not describe a real spa.',
  'Monday to Sunday: 9:00 AM to 6:00 PM',
  '[{"name":"Sample Signature Massage","description":"Illustrative treatment description for layout and profile review only.","duration":"60 min","price":"Sample price"},{"name":"Sample Facial Ritual","description":"Illustrative treatment description for layout and profile review only.","duration":"75 min","price":"Sample price"},{"name":"Sample Wellness Escape","description":"Illustrative treatment description for layout and profile review only.","duration":"90 min","price":"Sample price"}]',
  '{"name":"Sample Spa Day Package","description":"Illustrative package description for profile review only.","price":"Sample price"}',
  'https://app.spaplus.co/spaplus-mark.png',
  '["https://app.spaplus.co/hero.jpg","https://app.spaplus.co/spaplus-experience.jpeg","https://app.spaplus.co/vision-resort.webp","https://app.spaplus.co/vision-ritual.webp","https://app.spaplus.co/ontario/quebec-balnea.jpg"]',
  'system:approved-demo',
  '2026-08-18T20:47:52Z',
  '2026-08-19T00:30:00+03:00'
);
