ALTER TABLE `bug_reports` ADD `custom_project` text DEFAULT '' NOT NULL;
ALTER TABLE `bug_reports` ADD `target_key` text DEFAULT 'adir' NOT NULL;
ALTER TABLE `bug_reports` ADD `attachment_name` text DEFAULT '' NOT NULL;
ALTER TABLE `bug_reports` ADD `attachment_url` text DEFAULT '' NOT NULL;
