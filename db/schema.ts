import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const cmsUsers = sqliteTable(
  "cms_users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    displayName: text("display_name").notNull().default(""),
    role: text("role", { enum: ["owner", "editor", "viewer"] })
      .notNull()
      .default("viewer"),
    status: text("status", { enum: ["active", "inactive"] })
      .notNull()
      .default("active"),
    defaultLocale: text("default_locale").notNull().default("en"),
    systemLocale: text("system_locale").notNull().default("en"),
    canReportBugs: integer("can_report_bugs", { mode: "boolean" })
      .notNull()
      .default(false),
    lastLoginAt: text("last_login_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [uniqueIndex("cms_users_email_unique").on(table.email)],
);

export const cmsPermissions = sqliteTable(
  "cms_permissions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => cmsUsers.id, { onDelete: "cascade" }),
    resourceKey: text("resource_key").notNull(),
    canViewContent: integer("can_view_content", { mode: "boolean" })
      .notNull()
      .default(false),
    canEditContent: integer("can_edit_content", { mode: "boolean" })
      .notNull()
      .default(false),
    canViewLeads: integer("can_view_leads", { mode: "boolean" })
      .notNull()
      .default(false),
    canManageLeads: integer("can_manage_leads", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("cms_permissions_user_resource_unique").on(
      table.userId,
      table.resourceKey,
    ),
  ],
);

export const cmsContent = sqliteTable(
  "cms_content",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    locale: text("locale").notNull(),
    section: text("section").notNull(),
    field: text("field").notNull(),
    value: text("value").notNull(),
    updatedBy: text("updated_by").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("cms_content_locale_section_field_unique").on(
      table.locale,
      table.section,
      table.field,
    ),
  ],
);

export const cmsAuditLog = sqliteTable("cms_audit_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  actorEmail: text("actor_email").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  details: text("details").notNull().default("{}"),
  createdAt: text("created_at").notNull(),
});

export const spaPreviews = sqliteTable(
  "spa_previews",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    status: text("status", { enum: ["draft", "shared"] }).notNull().default("draft"),
    language: text("language", { enum: ["en", "fr-CA"] }).notNull().default("en"),
    spaName: text("spa_name").notNull(),
    address: text("address").notNull().default(""),
    about: text("about").notNull().default(""),
    hours: text("hours").notNull().default(""),
    treatments: text("treatments").notNull().default("[]"),
    spaPackage: text("spa_package").notNull().default("{}"),
    logoUrl: text("logo_url").notNull().default(""),
    photoUrls: text("photo_urls").notNull().default("[]"),
    createdBy: text("created_by").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [uniqueIndex("spa_previews_slug_unique").on(table.slug)],
);

export const spaPreviewMedia = sqliteTable(
  "spa_preview_media",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    objectKey: text("object_key").notNull(),
    url: text("url").notNull(),
    filename: text("filename").notNull(),
    contentType: text("content_type").notNull(),
    createdBy: text("created_by").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [uniqueIndex("spa_preview_media_object_key_unique").on(table.objectKey)],
);

export const formSubmissions = sqliteTable("form_submissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  submissionId: text("submission_id").notNull().unique(),
  formType: text("form_type").notNull().default("contact"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  organization: text("organization").notNull().default(""),
  topic: text("topic").notNull().default(""),
  message: text("message").notNull().default(""),
  locale: text("locale").notNull().default("en"),
  source: text("source").notNull().default(""),
  resourceKey: text("resource_key").notNull().default("site:global"),
  status: text("status", { enum: ["new", "in_progress", "closed", "won", "irrelevant", "deleted"] })
    .notNull()
    .default("new"),
  createdAt: text("created_at").notNull(),
});

export const leadStatusEvents = sqliteTable("lead_status_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  submissionId: integer("submission_id")
    .notNull()
    .references(() => formSubmissions.id, { onDelete: "cascade" }),
  fromStatus: text("from_status").notNull(),
  toStatus: text("to_status").notNull(),
  actorEmail: text("actor_email").notNull(),
  actorName: text("actor_name").notNull().default(""),
  createdAt: text("created_at").notNull(),
});

export const leadNotes = sqliteTable("lead_notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  submissionId: integer("submission_id")
    .notNull()
    .references(() => formSubmissions.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  state: text("state", { enum: ["open", "important", "handled"] })
    .notNull()
    .default("open"),
  actorEmail: text("actor_email").notNull(),
  actorName: text("actor_name").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const projectItems = sqliteTable("project_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  area: text("area").notNull().default("development"),
  status: text("status", { enum: ["planned", "in_progress", "waiting", "review", "nearly_done", "done", "archived"] })
    .notNull()
    .default("planned"),
  progress: integer("progress"),
  progressSource: text("progress_source", { enum: ["confirmed", "estimated", "unknown"] })
    .notNull()
    .default("unknown"),
  priority: text("priority", { enum: ["critical", "high", "medium", "low"] })
    .notNull()
    .default("medium"),
  owner: text("owner").notNull().default("אדיר"),
  collaborators: text("collaborators").notNull().default("[]"),
  currentPhase: text("current_phase").notNull().default(""),
  nextAction: text("next_action").notNull().default(""),
  blockers: text("blockers").notNull().default(""),
  targetDate: text("target_date"),
  sourceThreads: text("source_threads").notNull().default("[]"),
  tags: text("tags").notNull().default("[]"),
  siteUrl: text("site_url").notNull().default(""),
  publicVisible: integer("public_visible", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const projectTasks = sqliteTable("project_tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id")
    .notNull()
    .references(() => projectItems.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  status: text("status", { enum: ["planned", "in_progress", "waiting", "done"] })
    .notNull()
    .default("planned"),
  progress: integer("progress"),
  owner: text("owner").notNull().default("אדיר"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const projectNotes = sqliteTable("project_notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id")
    .notNull()
    .references(() => projectItems.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  state: text("state", { enum: ["open", "important", "handled"] })
    .notNull()
    .default("open"),
  actorEmail: text("actor_email").notNull(),
  actorName: text("actor_name").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const bugReports = sqliteTable("bug_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").references(() => projectItems.id, { onDelete: "set null" }),
  customProject: text("custom_project").notNull().default(""),
  targetKey: text("target_key").notNull().default("adir"),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  severity: text("severity", { enum: ["low", "medium", "high", "critical"] })
    .notNull()
    .default("medium"),
  status: text("status", { enum: ["new", "in_progress", "fixed", "closed"] })
    .notNull()
    .default("new"),
  pageUrl: text("page_url").notNull().default(""),
  steps: text("steps").notNull().default(""),
  expected: text("expected").notNull().default(""),
  actual: text("actual").notNull().default(""),
  reporterEmail: text("reporter_email").notNull(),
  reporterName: text("reporter_name").notNull().default(""),
  driveSyncStatus: text("drive_sync_status", { enum: ["not_configured", "pending", "synced", "failed"] })
    .notNull()
    .default("not_configured"),
  driveRowId: text("drive_row_id").notNull().default(""),
  driveError: text("drive_error").notNull().default(""),
  attachmentName: text("attachment_name").notNull().default(""),
  attachmentUrl: text("attachment_url").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
