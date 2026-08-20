CREATE TABLE `lead_ambassador_shipping_confirmations` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`school` text NOT NULL,
	`lead_status` text NOT NULL,
	`shipping_action` text NOT NULL,
	`label_name` text,
	`organization` text,
	`address_1` text,
	`address_2` text,
	`city` text,
	`state` text,
	`postal_code` text,
	`country` text DEFAULT 'United States',
	`phone` text,
	`delivery_notes` text,
	`shipment_type` text NOT NULL,
	`packet_quantity` integer,
	`shirt_interest` text,
	`shirt_size` text,
	`confirmed_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lead_ambassador_shipping_confirmations_email_unique` ON `lead_ambassador_shipping_confirmations` (`email`);