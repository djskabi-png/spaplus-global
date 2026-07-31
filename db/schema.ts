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
    lastLoginAt: text("last_login_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [uniqueIndex("cms_users_email_unique").on(table.email)],
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
  status: text("status", { enum: ["new", "in_progress", "closed"] })
    .notNull()
    .default("new"),
  createdAt: text("created_at").notNull(),
});
