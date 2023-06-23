/*
  Warnings:

  - You are about to drop the column `roomId` on the `Message` table. All the data in the column will be lost.
  - Added the required column `roomCode` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_roomId_fkey";

-- DropIndex
DROP INDEX "Message_roomId_idx";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "roomId",
ADD COLUMN     "roomCode" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Message_roomCode_idx" ON "Message"("roomCode");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_roomCode_fkey" FOREIGN KEY ("roomCode") REFERENCES "Room"("code") ON DELETE CASCADE ON UPDATE CASCADE;
