CREATE TABLE `meeting_bookings` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `booking_id` text NOT NULL,
  `organizer_email` text NOT NULL,
  `organizer_name` text DEFAULT '' NOT NULL,
  `guest_name` text NOT NULL,
  `guest_email` text NOT NULL,
  `title` text NOT NULL,
  `notes` text DEFAULT '' NOT NULL,
  `locale` text DEFAULT 'en' NOT NULL,
  `starts_at` text NOT NULL,
  `ends_at` text NOT NULL,
  `time_zone` text NOT NULL,
  `status` text DEFAULT 'pending' NOT NULL,
  `google_event_id` text DEFAULT '' NOT NULL,
  `meet_url` text DEFAULT '' NOT NULL,
  `calendar_url` text DEFAULT '' NOT NULL,
  `email_delivery_ids` text DEFAULT '[]' NOT NULL,
  `failure_reason` text DEFAULT '' NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `meeting_bookings_booking_id_unique` ON `meeting_bookings` (`booking_id`);
--> statement-breakpoint
CREATE INDEX `idx_meeting_bookings_organizer_starts_at` ON `meeting_bookings` (`organizer_email`,`starts_at`);
