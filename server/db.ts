import { asc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { drizzle } from "drizzle-orm/mysql2";
import {
  diagnosticRooms,
  InsertUser,
  passwordCredentials,
  userAccessibilityPreferences,
  userRoomChecklistProgress,
  users,
} from "../drizzle/schema";
import type { DiagnosticRoomContent } from "../client/src/lib/roomContent";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the Drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

function requireDb(db: Awaited<ReturnType<typeof getDb>>) {
  if (!db) throw new Error("Database is unavailable");
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");

  const db = requireDb(await getDb());
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];

  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };

  textFields.forEach(assignNullable);
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  try {
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = requireDb(await getDb());
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserById(userId: number) {
  const db = requireDb(await getDb());
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result[0];
}

export async function getUserByEmail(email: string) {
  const db = requireDb(await getDb());
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

export async function getPasswordCredentialByEmail(email: string) {
  const db = requireDb(await getDb());
  const result = await db.select().from(passwordCredentials).where(eq(passwordCredentials.email, email)).limit(1);
  return result[0];
}

export async function getPasswordCredentialByUserId(userId: number) {
  const db = requireDb(await getDb());
  const result = await db.select().from(passwordCredentials).where(eq(passwordCredentials.userId, userId)).limit(1);
  return result[0];
}

export async function createPasswordUser(input: { email: string; name: string | null; passwordHash: string }) {
  const db = requireDb(await getDb());
  const openId = `local_${randomUUID()}`;
  const now = new Date();
  return db.transaction(async (tx) => {
    await tx.insert(users).values({
      openId,
      email: input.email,
      name: input.name,
      loginMethod: "password",
      lastSignedIn: now,
    });
    const [user] = await tx.select().from(users).where(eq(users.openId, openId)).limit(1);
    if (!user) throw new Error("Created account could not be loaded");
    await tx.insert(passwordCredentials).values({
      userId: user.id,
      email: input.email,
      passwordHash: input.passwordHash,
    });
    return user;
  });
}

export async function attachPasswordCredentialToUser(input: { userId: number; email: string; passwordHash: string }) {
  const db = requireDb(await getDb());
  return db.transaction(async (tx) => {
    const [user] = await tx.select().from(users).where(eq(users.id, input.userId)).limit(1);
    if (!user) throw new Error("Account no longer exists");
    await tx.insert(passwordCredentials).values({
      userId: user.id,
      email: input.email,
      passwordHash: input.passwordHash,
    });
    await tx.update(users).set({
      email: input.email,
      loginMethod: "password",
      lastSignedIn: new Date(),
    }).where(eq(users.id, user.id));
    const [updatedUser] = await tx.select().from(users).where(eq(users.id, user.id)).limit(1);
    if (!updatedUser) throw new Error("Updated account could not be loaded");
    return updatedUser;
  });
}

export async function touchUserLastSignedIn(userId: number) {
  const db = requireDb(await getDb());
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId));
}

export async function listDiagnosticRooms() {
  const db = requireDb(await getDb());
  return db
    .select({ roomNumber: diagnosticRooms.roomNumber, slug: diagnosticRooms.slug, content: diagnosticRooms.content })
    .from(diagnosticRooms)
    .orderBy(asc(diagnosticRooms.roomNumber));
}

export async function getDiagnosticRoomBySlug(slug: string) {
  const db = requireDb(await getDb());
  const result = await db.select().from(diagnosticRooms).where(eq(diagnosticRooms.slug, slug)).limit(1);
  return result[0];
}

export type AccessibilityPreferences = {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
};

export async function getUserProgress(userId: number) {
  const db = requireDb(await getDb());
  const [preferenceRows, checklistRows] = await Promise.all([
    db.select({
      reducedMotion: userAccessibilityPreferences.reducedMotion,
      highContrast: userAccessibilityPreferences.highContrast,
      largeText: userAccessibilityPreferences.largeText,
    }).from(userAccessibilityPreferences).where(eq(userAccessibilityPreferences.userId, userId)).limit(1),
    db.select({ roomSlug: userRoomChecklistProgress.roomSlug, checkedItems: userRoomChecklistProgress.checkedItems })
      .from(userRoomChecklistProgress)
      .where(eq(userRoomChecklistProgress.userId, userId)),
  ]);

  const checklists: Record<string, string[]> = {};
  for (const row of checklistRows) checklists[row.roomSlug] = row.checkedItems;
  return { accountId: userId, preferences: preferenceRows[0] ?? null, checklists };
}

export async function upsertUserPreferences(userId: number, preferences: AccessibilityPreferences) {
  const db = requireDb(await getDb());
  await db.insert(userAccessibilityPreferences).values({ userId, ...preferences }).onDuplicateKeyUpdate({
    set: { ...preferences, updatedAt: new Date() },
  });
}

export async function upsertUserRoomProgress(userId: number, roomSlug: string, checkedItems: string[]) {
  const db = requireDb(await getDb());
  await db.insert(userRoomChecklistProgress).values({ userId, roomSlug, checkedItems }).onDuplicateKeyUpdate({
    set: { checkedItems, updatedAt: new Date() },
  });
}

export function isDiagnosticRoomContent(value: unknown): value is DiagnosticRoomContent {
  return Boolean(value && typeof value === "object" && "checklist" in value && Array.isArray((value as DiagnosticRoomContent).checklist));
}
