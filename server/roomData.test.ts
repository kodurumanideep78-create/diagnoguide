import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const database = vi.hoisted(() => ({
  listDiagnosticRooms: vi.fn(),
  getDiagnosticRoomBySlug: vi.fn(),
  getUserProgress: vi.fn(),
  upsertUserPreferences: vi.fn(),
  upsertUserRoomProgress: vi.fn(),
}));

vi.mock("./db", () => database);

import { roomContentRouter, userProgressRouter } from "./routers/roomData";

function context(userId?: number): TrpcContext {
  return {
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
    legacyUser: null,
    user: userId
      ? ({
          id: userId,
          openId: `test-user-${userId}`,
          name: null,
          email: null,
          loginMethod: "test",
          role: "user",
          createdAt: new Date(0),
          updatedAt: new Date(0),
          lastSignedIn: new Date(0),
        } as TrpcContext["user"])
      : null,
  };
}

describe("room content and signed-in progress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("serves public room content from the database helper", async () => {
    const rows = [{ roomNumber: 1, slug: "mammography", content: { name: "Mammography" } }];
    database.listDiagnosticRooms.mockResolvedValue(rows);

    const caller = roomContentRouter.createCaller(context());

    await expect(caller.list()).resolves.toEqual(rows);
    expect(database.listDiagnosticRooms).toHaveBeenCalledOnce();
  });

  it("rejects progress access for a visitor who is not signed in", async () => {
    const caller = userProgressRouter.createCaller(context());

    await expect(caller.mine({ accountId: 7 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(database.getUserProgress).not.toHaveBeenCalled();
  });

  it("scopes progress reads to the authenticated account and rejects mismatched cache scopes", async () => {
    const caller = userProgressRouter.createCaller(context(7));
    const progress = { accountId: 7, preferences: null, checklists: {} };
    database.getUserProgress.mockResolvedValue(progress);

    await expect(caller.mine({ accountId: 7 })).resolves.toEqual(progress);
    expect(database.getUserProgress).toHaveBeenCalledWith(7);
    await expect(caller.mine({ accountId: 8 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(database.getUserProgress).toHaveBeenCalledTimes(1);
  });

  it("writes preferences for the authenticated account, never an input-supplied account", async () => {
    const caller = userProgressRouter.createCaller(context(12));
    const preferences = { reducedMotion: true, highContrast: false, largeText: true };

    await caller.savePreferences({ ...preferences, userId: 99 } as typeof preferences & { userId: number });

    expect(database.upsertUserPreferences).toHaveBeenCalledWith(12, preferences);
  });

  it("accepts only checklist items belonging to the selected room", async () => {
    const caller = userProgressRouter.createCaller(context(21));
    database.getDiagnosticRoomBySlug.mockResolvedValue({
      roomNumber: 1,
      slug: "mammography",
      content: { checklist: ["Confirm preparation", "Ask about medicines"] },
    });

    await caller.saveChecklist({ roomSlug: "mammography", checkedItems: ["Ask about medicines"] });

    expect(database.upsertUserRoomProgress).toHaveBeenCalledWith(21, "mammography", ["Ask about medicines"]);
    await expect(
      caller.saveChecklist({ roomSlug: "mammography", checkedItems: ["Unrelated selection"] }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(database.upsertUserRoomProgress).toHaveBeenCalledTimes(1);
  });
});
