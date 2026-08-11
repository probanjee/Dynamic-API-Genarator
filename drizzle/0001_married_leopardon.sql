CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int,
	`userId` int,
	`action` varchar(255) NOT NULL,
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `endpoints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`method` enum('GET','POST','PUT','DELETE','PATCH') NOT NULL,
	`path` varchar(512) NOT NULL,
	`summary` varchar(255),
	`description` text,
	`parameters` json,
	`requestBodySchemaId` int,
	`responseSchemaId` int,
	`responseStatusCode` int NOT NULL DEFAULT 200,
	`authentication` varchar(64) NOT NULL DEFAULT 'jwt',
	`middleware` json,
	`rateLimit` varchar(64) DEFAULT '100/min',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `endpoints_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `generated_artifacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`runtime` varchar(64) NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`fileUrl` text NOT NULL,
	`format` varchar(32) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generated_artifacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `middleware_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` varchar(64) NOT NULL,
	`enabled` int NOT NULL DEFAULT 1,
	`config` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `middleware_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`version` varchar(32) NOT NULL DEFAULT '1.0.0',
	`baseUrl` varchar(512) NOT NULL DEFAULT 'https://api.example.com',
	`tags` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `schemas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`definition` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `schemas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `security_scans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`score` int NOT NULL,
	`findings` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `security_scans_id` PRIMARY KEY(`id`)
);
