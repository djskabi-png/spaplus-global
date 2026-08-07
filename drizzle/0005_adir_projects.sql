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
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
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
CREATE INDEX `project_tasks_project_idx` ON `project_tasks` (`project_id`);
