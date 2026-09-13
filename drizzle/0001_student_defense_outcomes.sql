CREATE TABLE IF NOT EXISTS `student_defense_outcomes` (
	`id` text PRIMARY KEY NOT NULL,
	`tool` text NOT NULL,
	`status` text NOT NULL,
	`school` text,
	`amount_cents` integer,
	`outcome` text NOT NULL,
	`consent_at` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_student_defense_outcomes_created` ON `student_defense_outcomes` (`created_at`);
