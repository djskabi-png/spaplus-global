CREATE TABLE `cms_permissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`resource_key` text NOT NULL,
	`can_view_content` integer DEFAULT false NOT NULL,
	`can_edit_content` integer DEFAULT false NOT NULL,
	`can_view_leads` integer DEFAULT false NOT NULL,
	`can_manage_leads` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `cms_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cms_permissions_user_resource_unique` ON `cms_permissions` (`user_id`,`resource_key`);--> statement-breakpoint
INSERT INTO `cms_permissions` (`user_id`,`resource_key`,`can_view_content`,`can_edit_content`,`can_view_leads`,`can_manage_leads`,`created_at`,`updated_at`)
SELECT `id`,'site:global',1,CASE WHEN `role` = 'editor' THEN 1 ELSE 0 END,1,CASE WHEN `role` = 'editor' THEN 1 ELSE 0 END,datetime('now'),datetime('now')
FROM `cms_users` WHERE `role` != 'owner';--> statement-breakpoint
INSERT INTO `cms_permissions` (`user_id`,`resource_key`,`can_view_content`,`can_edit_content`,`can_view_leads`,`can_manage_leads`,`created_at`,`updated_at`)
SELECT `id`,'market:ca:on',1,CASE WHEN `role` = 'editor' THEN 1 ELSE 0 END,1,CASE WHEN `role` = 'editor' THEN 1 ELSE 0 END,datetime('now'),datetime('now')
FROM `cms_users` WHERE `role` != 'owner';--> statement-breakpoint
ALTER TABLE `cms_users` ADD `system_locale` text DEFAULT 'en' NOT NULL;--> statement-breakpoint
UPDATE `cms_users` SET `system_locale` = 'he' WHERE `role` = 'owner';--> statement-breakpoint
ALTER TABLE `form_submissions` ADD `resource_key` text DEFAULT 'site:global' NOT NULL;
