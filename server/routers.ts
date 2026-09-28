import { systemRouter } from "./_core/systemRouter";
import { router } from "./_core/trpc";
import { authRouter } from "./routers/auth";
import { roomContentRouter, userProgressRouter } from "./routers/roomData";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  roomContent: roomContentRouter,
  userProgress: userProgressRouter,
});

export type AppRouter = typeof appRouter;
