import { diagnosticRoomContent } from "../client/src/lib/roomContent";
import { diagnosticRooms } from "../drizzle/schema";
import { getDb } from "./db";

async function seedRooms() {
  const db = await getDb();
  if (!db) throw new Error("DATABASE_URL is required to seed diagnostic rooms.");

  try {
    for (const content of diagnosticRoomContent) {
      await db.insert(diagnosticRooms).values({
        roomNumber: content.roomNumber,
        slug: content.id,
        content,
      }).onDuplicateKeyUpdate({
        set: {
          slug: content.id,
          content,
          updatedAt: new Date(),
        },
      });
    }

    console.log(`Seeded ${diagnosticRoomContent.length} public diagnostic room records.`);
  } finally {
    await db.$client.end();
  }
}

seedRooms().catch((error: unknown) => {
  console.error("Failed to seed public room content:", error);
  process.exitCode = 1;
});
