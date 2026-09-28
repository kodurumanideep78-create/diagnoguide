import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDiagnosticRoomBySlug, getUserProgress, listDiagnosticRooms, upsertUserPreferences, upsertUserRoomProgress } from "../db";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

export const roomContentRouter = router({
  list: publicProcedure.query(async () => listDiagnosticRooms()),
});

const preferencesInput = z.object({
  reducedMotion: z.boolean(),
  highContrast: z.boolean(),
  largeText: z.boolean(),
});

export const userProgressRouter = router({
  // accountId is included only to separate client query-cache entries. It is
  // checked against the authenticated context and is never used as authority.
  mine: protectedProcedure
    .input(z.object({ accountId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      if (input.accountId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Progress belongs to the signed-in account." });
      }
      return getUserProgress(ctx.user.id);
    }),

  savePreferences: protectedProcedure
    .input(preferencesInput)
    .mutation(async ({ ctx, input }) => {
      await upsertUserPreferences(ctx.user.id, input);
      return { success: true as const };
    }),

  saveChecklist: protectedProcedure
    .input(z.object({
      roomSlug: z.string().min(1).max(80),
      checkedItems: z.array(z.string().min(1).max(500)).max(20),
    }))
    .mutation(async ({ ctx, input }) => {
      const room = await getDiagnosticRoomBySlug(input.roomSlug);
      if (!room) throw new TRPCError({ code: "NOT_FOUND", message: "Diagnostic room not found." });

      const allowedItems = new Set(room.content.checklist);
      const checkedItems = Array.from(new Set(input.checkedItems));
      if (checkedItems.some((item) => !allowedItems.has(item))) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Checklist selections must belong to the selected room." });
      }

      await upsertUserRoomProgress(ctx.user.id, input.roomSlug, checkedItems);
      return { success: true as const };
    }),
});
