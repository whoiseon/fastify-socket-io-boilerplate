/*
  Warnings:

  - You are about to drop the `PrivateMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PrivateRoom` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PublicMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PublicRoom` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PrivateMessage" DROP CONSTRAINT "PrivateMessage_roomId_fkey";

-- DropForeignKey
ALTER TABLE "PrivateMessage" DROP CONSTRAINT "PrivateMessage_userId_fkey";

-- DropForeignKey
ALTER TABLE "PrivateRoom" DROP CONSTRAINT "PrivateRoom_fromId_fkey";

-- DropForeignKey
ALTER TABLE "PrivateRoom" DROP CONSTRAINT "PrivateRoom_toId_fkey";

-- DropForeignKey
ALTER TABLE "PublicMessage" DROP CONSTRAINT "PublicMessage_roomId_fkey";

-- DropForeignKey
ALTER TABLE "PublicMessage" DROP CONSTRAINT "PublicMessage_userId_fkey";

-- DropForeignKey
ALTER TABLE "PublicRoom" DROP CONSTRAINT "PublicRoom_managerId_fkey";

-- DropTable
DROP TABLE "PrivateMessage";

-- DropTable
DROP TABLE "PrivateRoom";

-- DropTable
DROP TABLE "PublicMessage";

-- DropTable
DROP TABLE "PublicRoom";

-- CreateTable
CREATE TABLE "Room" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "managerId" INTEGER NOT NULL,
    "lastMessage" TEXT,
    "timeOfLastMessage" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER,
    "roomId" INTEGER,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Room_name_key" ON "Room"("name");

-- CreateIndex
CREATE INDEX "Message_userId_idx" ON "Message"("userId");

-- CreateIndex
CREATE INDEX "Message_roomId_idx" ON "Message"("roomId");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
