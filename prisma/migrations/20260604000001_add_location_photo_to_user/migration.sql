-- AlterTable: add location and profilePhotoUrl to User
ALTER TABLE "User" ADD COLUMN "location" TEXT;
ALTER TABLE "User" ADD COLUMN "profilePhotoUrl" TEXT;
