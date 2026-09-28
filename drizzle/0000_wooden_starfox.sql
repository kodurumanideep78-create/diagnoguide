CREATE TABLE `diagnostic_rooms` (
	`roomNumber` int NOT NULL,
	`slug` varchar(80) NOT NULL,
	`content` json NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `diagnostic_rooms_roomNumber` PRIMARY KEY(`roomNumber`),
	CONSTRAINT `diagnostic_rooms_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `user_accessibility_preferences` (
	`userId` int NOT NULL,
	`reducedMotion` boolean NOT NULL DEFAULT false,
	`highContrast` boolean NOT NULL DEFAULT false,
	`largeText` boolean NOT NULL DEFAULT false,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_accessibility_preferences_userId` PRIMARY KEY(`userId`)
);
--> statement-breakpoint
CREATE TABLE `user_room_checklist_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`roomSlug` varchar(80) NOT NULL,
	`checkedItems` json NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_room_checklist_progress_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_room_checklist_user_room_unique` UNIQUE(`userId`,`roomSlug`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
ALTER TABLE `user_accessibility_preferences` ADD CONSTRAINT `user_accessibility_preferences_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_room_checklist_progress` ADD CONSTRAINT `user_room_checklist_progress_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_room_checklist_progress` ADD CONSTRAINT `user_room_checklist_progress_roomSlug_diagnostic_rooms_slug_fk` FOREIGN KEY (`roomSlug`) REFERENCES `diagnostic_rooms`(`slug`) ON DELETE cascade ON UPDATE no action;