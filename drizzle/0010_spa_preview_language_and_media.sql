ALTER TABLE `spa_previews` ADD `language` text DEFAULT 'en' NOT NULL;
--> statement-breakpoint
CREATE TABLE `spa_preview_media` (
  `id` integer PRIMARY KEY NOT NULL,
  `object_key` text NOT NULL,
  `url` text NOT NULL,
  `filename` text NOT NULL,
  `content_type` text NOT NULL,
  `created_by` text NOT NULL,
  `created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spa_preview_media_object_key_unique` ON `spa_preview_media` (`object_key`);
