-- AlterTable
ALTER TABLE "Entity" ADD COLUMN     "hasActivity" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "canUpdate" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "FileUploadProgress" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "progressServer" INTEGER NOT NULL,
    "progressStorage" INTEGER NOT NULL,
    "url" TEXT,
    "error" TEXT,

    CONSTRAINT "FileUploadProgress_pkey" PRIMARY KEY ("id")
);
