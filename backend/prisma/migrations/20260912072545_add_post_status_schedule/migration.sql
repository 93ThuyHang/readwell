-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "publishAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'published';
