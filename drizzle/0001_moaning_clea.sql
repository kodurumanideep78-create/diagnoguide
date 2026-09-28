CREATE TABLE `password_credentials` (
	`userId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `password_credentials_userId` PRIMARY KEY(`userId`),
	CONSTRAINT `password_credentials_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `password_credentials` ADD CONSTRAINT `password_credentials_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;