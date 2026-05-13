import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

// ── Enums ──────────────────────────────────────────────────────────
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const chatSessionStatusEnum = pgEnum("chat_session_status", ["active", "archived"]);
export const chatMessageRoleEnum = pgEnum("chat_message_role", ["user", "assistant", "system"]);
export const documentTypeEnum = pgEnum("document_type", [
  "note",
  "draft",
  "template",
  "brainstorm",
]);
export const toolCategoryEnum = pgEnum("tool_category", [
  "calculator",
  "chatbot",
  "productivity",
  "security",
  "ai",
]);
export const toolStatusEnum = pgEnum("tool_status", ["active", "inactive", "beta"]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "info",
  "warning",
  "success",
  "update",
]);
export const workStatusEnum = pgEnum("work_status", ["todo", "in_progress", "review", "done"]);
export const workPriorityEnum = pgEnum("work_priority", ["low", "medium", "high"]);
export const eventTypeEnum = pgEnum("event_type", ["meeting", "deadline", "reminder", "task"]);
export const executionStatusEnum = pgEnum("execution_status", ["success", "error", "pending"]);
export const companyEnum = pgEnum("company", [
  "VVC",
  "Spontiva",
  "Investbotiq",
  "WoningVry",
  "Djobba",
  "Boastplug",
  "Sabibank",
  "Zheavenzy",
]);
export const workspaceDocSectionEnum = pgEnum("workspace_doc_section", [
  "codes",
  "informatie",
  "content",
]);
export const workspaceDocKindEnum = pgEnum("workspace_doc_kind", ["code", "markdown", "text"]);

// ── Tables ─────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("union_id", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("last_sign_in_at", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  status: chatSessionStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ChatSession = typeof chatSessions.$inferSelect;

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => chatSessions.id),
  role: chatMessageRoleEnum("role").notNull(),
  content: text("content").notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  type: documentTypeEnum("type").default("note").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Document = typeof documents.$inferSelect;

export const tools = pgTable("tools", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  category: toolCategoryEnum("category").notNull(),
  icon: varchar("icon", { length: 100 }),
  status: toolStatusEnum("status").default("active").notNull(),
  config: text("config"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Tool = typeof tools.$inferSelect;

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: notificationTypeEnum("type").default("info").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  link: varchar("link", { length: 500 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;

export const workItems = pgTable("work_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: workStatusEnum("status").default("todo").notNull(),
  priority: workPriorityEnum("priority").default("medium").notNull(),
  assignee: varchar("assignee", { length: 255 }),
  dueDate: timestamp("due_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type WorkItem = typeof workItems.$inferSelect;

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  start: timestamp("start", { withTimezone: true }).notNull(),
  end: timestamp("end_at", { withTimezone: true }).notNull(),
  type: eventTypeEnum("type").default("meeting").notNull(),
  location: varchar("location", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;

export const toolExecutions = pgTable("tool_executions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  toolId: integer("tool_id").references(() => tools.id),
  input: text("input"),
  output: text("output"),
  status: executionStatusEnum("status").default("success").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ToolExecution = typeof toolExecutions.$inferSelect;

export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  mode: varchar("mode", { length: 32 }).notNull(),
  metadata: jsonb("metadata"),
});

export type Session = typeof sessions.$inferSelect;

export const moduleRuns = pgTable("module_runs", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 64 }).notNull(),
  moduleId: varchar("module_id", { length: 128 }).notNull(),
  capability: varchar("capability", { length: 128 }).notNull(),
  input: jsonb("input"),
  output: jsonb("output"),
  durationMs: integer("duration_ms"),
  ok: boolean("ok").default(true),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type ModuleRun = typeof moduleRuns.$inferSelect;

export const workflowRuns = pgTable("workflow_runs", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 64 }).notNull(),
  steps: jsonb("steps"),
  status: varchar("status", { length: 32 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type WorkflowRun = typeof workflowRuns.$inferSelect;

export const moduleRegistry = pgTable("module_registry", {
  id: varchar("id", { length: 128 }).primaryKey(),
  manifest: jsonb("manifest").notNull(),
  enabled: boolean("enabled").default(true),
  installedAt: timestamp("installed_at", { withTimezone: true }).defaultNow(),
});

export type ModuleRegistry = typeof moduleRegistry.$inferSelect;

// ── NEW: Organogram (CRUD) ─────────────────────────────────────────
export const organogramNodes = pgTable("organogram_nodes", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  level: integer("level").default(0).notNull(),
  color: varchar("color", { length: 16 }).default("#10b981").notNull(),
  iconKey: varchar("icon_key", { length: 32 }).default("user").notNull(),
  parentId: varchar("parent_id", { length: 64 }),
  orderIndex: integer("order_index").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type OrganogramNode = typeof organogramNodes.$inferSelect;
export type InsertOrganogramNode = typeof organogramNodes.$inferInsert;

// ── NEW: Workspace Documents (per company/section CRUD) ───────────
export const workspaceDocuments = pgTable("workspace_documents", {
  id: varchar("id", { length: 64 }).primaryKey(),
  company: companyEnum("company").notNull(),
  section: workspaceDocSectionEnum("section").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  kind: workspaceDocKindEnum("kind").default("text").notNull(),
  language: varchar("language", { length: 32 }),
  content: text("content").default("").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type WorkspaceDocument = typeof workspaceDocuments.$inferSelect;
export type InsertWorkspaceDocument = typeof workspaceDocuments.$inferInsert;
