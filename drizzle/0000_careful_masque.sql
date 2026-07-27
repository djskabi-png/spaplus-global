CREATE TABLE `cms_audit_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`actor_email` text NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`details` text DEFAULT '{}' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cms_content` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`locale` text NOT NULL,
	`section` text NOT NULL,
	`field` text NOT NULL,
	`value` text NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cms_content_locale_section_field_unique` ON `cms_content` (`locale`,`section`,`field`);--> statement-breakpoint
CREATE TABLE `cms_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`display_name` text DEFAULT '' NOT NULL,
	`role` text DEFAULT 'viewer' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`last_login_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cms_users_email_unique` ON `cms_users` (`email`);--> statement-breakpoint
CREATE TABLE `form_submissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`submission_id` text NOT NULL,
	`form_type` text DEFAULT 'contact' NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`organization` text DEFAULT '' NOT NULL,
	`topic` text DEFAULT '' NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`locale` text DEFAULT 'en' NOT NULL,
	`source` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `form_submissions_submission_id_unique` ON `form_submissions` (`submission_id`);