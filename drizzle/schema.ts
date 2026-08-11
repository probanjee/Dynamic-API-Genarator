import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, longtext } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  version: varchar("version", { length: 32 }).default("1.0.0").notNull(),
  baseUrl: varchar("baseUrl", { length: 512 }).default("https://api.example.com").notNull(),
  tags: json("tags"), // array of strings
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const projectMembers = mysqlTable("project_members", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  role: mysqlEnum("role", ["OWNER", "ADMIN", "DEVELOPER", "VIEWER"]).default("DEVELOPER").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjectMember = typeof projectMembers.$inferSelect;
export type InsertProjectMember = typeof projectMembers.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

export const endpoints = mysqlTable("endpoints", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  method: mysqlEnum("method", ["GET", "POST", "PUT", "DELETE", "PATCH"]).notNull(),
  path: varchar("path", { length: 512 }).notNull(),
  summary: varchar("summary", { length: 255 }),
  description: text("description"),
  parameters: json("parameters"), // array of query/path/header/cookie params
  requestBodySchemaId: int("requestBodySchemaId"),
  responseSchemaId: int("responseSchemaId"),
  responseStatusCode: int("responseStatusCode").default(200).notNull(),
  authentication: varchar("authentication", { length: 64 }).default("jwt").notNull(), // jwt, api_key, oauth2, none
  middleware: json("middleware"), // array of enabled middleware names
  rateLimit: varchar("rateLimit", { length: 64 }).default("100/min"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Endpoint = typeof endpoints.$inferSelect;
export type InsertEndpoint = typeof endpoints.$inferInsert;

export const schemas = mysqlTable("schemas", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  definition: json("definition").notNull(), // JSON schema or field definitions array
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SchemaEntity = typeof schemas.$inferSelect;
export type InsertSchemaEntity = typeof schemas.$inferInsert;

export const middlewareConfigs = mysqlTable("middleware_configs", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 64 }).notNull(), // auth, rate_limit, cors, logging, caching, transform
  enabled: int("enabled").default(1).notNull(), // 1 or 0
  config: json("config").notNull(), // settings object
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MiddlewareConfig = typeof middlewareConfigs.$inferSelect;
export type InsertMiddlewareConfig = typeof middlewareConfigs.$inferInsert;

export const securityScans = mysqlTable("security_scans", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  score: int("score").notNull(), // 0 - 100
  findings: json("findings").notNull(), // array of issues: { title, severity, description, recommendation }
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SecurityScan = typeof securityScans.$inferSelect;
export type InsertSecurityScan = typeof securityScans.$inferInsert;

export const generatedArtifacts = mysqlTable("generated_artifacts", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  runtime: varchar("runtime", { length: 64 }).notNull(), // fastapi or express
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  format: varchar("format", { length: 32 }).notNull(), // zip, yaml, json
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GeneratedArtifact = typeof generatedArtifacts.$inferSelect;
export type InsertGeneratedArtifact = typeof generatedArtifacts.$inferInsert;

export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId"),
  userId: int("userId"),
  action: varchar("action", { length: 255 }).notNull(),
  details: text("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
