ALTER TABLE `cms_users` ADD `default_locale` text DEFAULT 'en' NOT NULL;
UPDATE `cms_users` SET `default_locale` = 'he' WHERE `role` = 'owner';
