CREATE TABLE `bug_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer,
	`custom_project` text DEFAULT '' NOT NULL,
	`target_key` text DEFAULT 'adir' NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`severity` text DEFAULT 'medium' NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`page_url` text DEFAULT '' NOT NULL,
	`steps` text DEFAULT '' NOT NULL,
	`expected` text DEFAULT '' NOT NULL,
	`actual` text DEFAULT '' NOT NULL,
	`reporter_email` text NOT NULL,
	`reporter_name` text DEFAULT '' NOT NULL,
	`drive_sync_status` text DEFAULT 'not_configured' NOT NULL,
	`drive_row_id` text DEFAULT '' NOT NULL,
	`drive_error` text DEFAULT '' NOT NULL,
	`attachment_name` text DEFAULT '' NOT NULL,
	`attachment_url` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `project_items`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `project_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`area` text DEFAULT 'development' NOT NULL,
	`status` text DEFAULT 'planned' NOT NULL,
	`progress` integer,
	`progress_source` text DEFAULT 'unknown' NOT NULL,
	`priority` text DEFAULT 'medium' NOT NULL,
	`owner` text DEFAULT 'אדיר' NOT NULL,
	`collaborators` text DEFAULT '[]' NOT NULL,
	`current_phase` text DEFAULT '' NOT NULL,
	`next_action` text DEFAULT '' NOT NULL,
	`blockers` text DEFAULT '' NOT NULL,
	`target_date` text,
	`source_threads` text DEFAULT '[]' NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`site_url` text DEFAULT '' NOT NULL,
	`public_visible` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `project_notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`body` text NOT NULL,
	`state` text DEFAULT 'open' NOT NULL,
	`actor_email` text NOT NULL,
	`actor_name` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `project_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `project_tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`title` text NOT NULL,
	`status` text DEFAULT 'planned' NOT NULL,
	`progress` integer,
	`owner` text DEFAULT 'אדיר' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `project_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `spa_previews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`spa_name` text NOT NULL,
	`address` text DEFAULT '' NOT NULL,
	`about` text DEFAULT '' NOT NULL,
	`hours` text DEFAULT '' NOT NULL,
	`treatments` text DEFAULT '[]' NOT NULL,
	`spa_package` text DEFAULT '{}' NOT NULL,
	`logo_url` text DEFAULT '' NOT NULL,
	`photo_urls` text DEFAULT '[]' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spa_previews_slug_unique` ON `spa_previews` (`slug`);--> statement-breakpoint
ALTER TABLE `cms_users` ADD `can_report_bugs` integer DEFAULT false NOT NULL;