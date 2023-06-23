export interface RoomDeleteParams {
  userId: number;
  roomId: string;
}

export interface CreateSendMessageParams {
  userId: number;
  roomCode: string;
  content: string;
}

export interface CreateRoomParams {
  userId: number;
  name: string;
  description: string;
}
