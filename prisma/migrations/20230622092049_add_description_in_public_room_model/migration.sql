/*
  Warnings:

  - You are about to drop the column `user1Id` on the `PrivateRoom` table. All the data in the column will be lost.
  - You are about to drop the column `user2Id` on the `PrivateRoom` table. All the data in the column will be lost.
  - Added the required column `fromId` to the `PrivateRoom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toId` to the `PrivateRoom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `PublicRoom` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PrivateRoom" DROP CONSTRAINT "PrivateRoom_user1Id_fkey";

-- DropForeignKey
ALTER TABLE "PrivateRoom" DROP CONSTRAINT "PrivateRoom_user2Id_fkey";

-- AlterTable
ALTER TABLE "PrivateRoom" DROP COLUMN "user1Id",
DROP COLUMN "user2Id",
ADD COLUMN     "fromId" INTEGER NOT NULL,
ADD COLUMN     "toId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "PublicRoom" ADD COLUMN     "description" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "PrivateRoom" ADD CONSTRAINT "PrivateRoom_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateRoom" ADD CONSTRAINT "PrivateRoom_toId_fkey" FOREIGN KEY ("toId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
