DROP TABLE IF EXISTS `guestBook`;
--> statement-breakpoint
DROP INDEX IF EXISTS `guestBook_email_unique`;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `todos` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);