ALTER TABLE `cms_users` ADD `can_report_bugs` integer DEFAULT 0 NOT NULL;

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

CREATE INDEX `project_notes_project_idx` ON `project_notes` (`project_id`);

CREATE TABLE `project_workspace_meta` (
  `key` text PRIMARY KEY NOT NULL,
  `value` text NOT NULL,
  `updated_at` text NOT NULL
);

CREATE TABLE `bug_reports` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `project_id` integer,
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
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  FOREIGN KEY (`project_id`) REFERENCES `project_items`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE INDEX `bug_reports_project_idx` ON `bug_reports` (`project_id`);
