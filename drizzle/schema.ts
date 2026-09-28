import type { DiagnosticRoomContent } from "../client/src/lib/roomContent";
import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/** Application accounts. Legacy openIds remain for one-time account conversion. */
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

/** Password hashes and login emails; raw passwords are never persisted. */
export const passwordCredentials = mysqlTable("password_credentials", {
  userId: int("userId").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PasswordCredential = typeof passwordCredentials.$inferSelect;

/** Public, non-personal educational room content served by the site. */
export const diagnosticRooms = mysqlTable("diagnostic_rooms", {
  roomNumber: int("roomNumber").primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  content: json("content").$type<DiagnosticRoomContent>().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Signed-in users' accessible-viewing preferences. */
export const userAccessibilityPreferences = mysqlTable("user_accessibility_preferences", {
  userId: int("userId").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  reducedMotion: boolean("reducedMotion").default(false).notNull(),
  highContrast: boolean("highContrast").default(false).notNull(),
  largeText: boolean("largeText").default(false).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Checklist selections are private to the signed-in user and room. */
export const userRoomChecklistProgress = mysqlTable(
  "user_room_checklist_progress",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    roomSlug: varchar("roomSlug", { length: 80 }).notNull().references(() => diagnosticRooms.slug, { onDelete: "cascade" }),
    checkedItems: json("checkedItems").$type<string[]>().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userRoomUnique: uniqueIndex("user_room_checklist_user_room_unique").on(table.userId, table.roomSlug),
  }),
);
