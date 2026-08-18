-- Ensures the Sites-managed D1 binding receives the preview table on existing projects.
CREATE TABLE IF NOT EXISTS `spa_previews` (
  `id` integer PRIMARY KEY NOT NULL,
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
CREATE UNIQUE INDEX IF NOT EXISTS `spa_previews_slug_unique` ON `spa_previews` (`slug`);
