import { diagnosticRoomDetails, diagnosticRoomImages } from "./diagnosticRooms";
import { rooms, type Room } from "./rooms";
import type { DiagnosticRoomDetail } from "./diagnosticRooms";

export type DiagnosticRoomContent = Room & DiagnosticRoomDetail & {
  roomNumber: number;
  image: string;
};

export const diagnosticRoomContent: DiagnosticRoomContent[] = rooms.map((room, index) => ({
  ...room,
  ...diagnosticRoomDetails[index],
  roomNumber: index + 1,
  image: diagnosticRoomImages[index],
}));
