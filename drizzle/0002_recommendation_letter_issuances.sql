CREATE TABLE IF NOT EXISTS `recommendation_letter_issuances` (
  `id` text PRIMARY KEY NOT NULL,
  `reference` text NOT NULL UNIQUE,
  `client_nonce` text NOT NULL UNIQUE,
  `student_name` text NOT NULL,
  `student_email` text NOT NULL,
  `student_phone` text NOT NULL,
  `school` text NOT NULL,
  `major` text NOT NULL,
  `gpa` text,
  `scholarship_name` text NOT NULL,
  `scholarship_organization` text NOT NULL,
  `eff_connection` text NOT NULL,
  `strengths` text NOT NULL,
  `achievement` text NOT NULL,
  `challenge` text,
  `future_goal` text NOT NULL,
  `pronouns` text NOT NULL,
  `first_action` text NOT NULL,
  `request_fingerprint` text NOT NULL,
  `status` text NOT NULL DEFAULT 'issued',
  `notification_status` text NOT NULL DEFAULT 'pending',
  `consent_at` text NOT NULL,
  `created_at` text NOT NULL,
  `revoked_at` text,
  `revocation_reason` text
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_recommendation_issuances_created` ON `recommendation_letter_issuances` (`created_at` DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_recommendation_issuances_status` ON `recommendation_letter_issuances` (`status`, `created_at` DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_recommendation_issuances_email_limit` ON `recommendation_letter_issuances` (`student_email`, `created_at` DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_recommendation_issuances_network_limit` ON `recommendation_letter_issuances` (`request_fingerprint`, `created_at` DESC);
