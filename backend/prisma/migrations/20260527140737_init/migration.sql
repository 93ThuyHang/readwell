-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "categories" TEXT[],
    "date" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "readTime" TEXT NOT NULL,
    "paragraphs" JSONB NOT NULL,
    "embed" JSONB NOT NULL,
    "afterEmbed" TEXT,
    "bookEmbed" JSONB,
    "hashtags" TEXT[],
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stats" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "books" INTEGER NOT NULL,
    "reviews" INTEGER NOT NULL,
    "videos" INTEGER NOT NULL,
    "recentDays" INTEGER NOT NULL,

    CONSTRAINT "Stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeaturedQuote" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "quote" TEXT NOT NULL,
    "attribution" TEXT NOT NULL,

    CONSTRAINT "FeaturedQuote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");
