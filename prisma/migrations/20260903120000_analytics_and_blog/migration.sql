-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "views" INTEGER NOT NULL DEFAULT 1,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "landingPath" TEXT,
    "lastPath" TEXT,
    "referrer" TEXT,
    "source" TEXT,
    "medium" TEXT,
    "campaign" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignupMeta" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" TEXT,
    "medium" TEXT,
    "campaign" TEXT,
    "referrer" TEXT,
    "landingPath" TEXT,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignupMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "seoTitle" TEXT,
    "description" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Guides',
    "targets" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 100,
    "blocksJson" TEXT NOT NULL DEFAULT '[]',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Visit_day_idx" ON "Visit"("day");

-- CreateIndex
CREATE INDEX "Visit_lastSeenAt_idx" ON "Visit"("lastSeenAt");

-- CreateIndex
CREATE INDEX "Visit_day_source_idx" ON "Visit"("day", "source");

-- CreateIndex
CREATE INDEX "Visit_day_country_idx" ON "Visit"("day", "country");

-- CreateIndex
CREATE UNIQUE INDEX "Visit_visitorId_day_key" ON "Visit"("visitorId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "SignupMeta_userId_key" ON "SignupMeta"("userId");

-- CreateIndex
CREATE INDEX "SignupMeta_createdAt_idx" ON "SignupMeta"("createdAt");

-- CreateIndex
CREATE INDEX "SignupMeta_source_idx" ON "SignupMeta"("source");

-- CreateIndex
CREATE INDEX "SignupMeta_country_idx" ON "SignupMeta"("country");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_status_position_idx" ON "BlogPost"("status", "position");

-- AddForeignKey
ALTER TABLE "SignupMeta" ADD CONSTRAINT "SignupMeta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

