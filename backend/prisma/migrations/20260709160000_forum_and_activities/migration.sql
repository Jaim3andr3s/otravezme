-- Foro estilo "muro" (posts + likes + comentarios) y Actividades (tareas que
-- el admin publica y los lectores entregan, con archivo adjunto opcional).

CREATE TYPE "ActivitySubmissionStatus" AS ENUM ('ENVIADA', 'REVISADA');

CREATE TABLE "ForumPost" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER,
    "authorName" TEXT NOT NULL,
    "authorAvatar" TEXT,
    "isAdminPost" BOOLEAN NOT NULL DEFAULT false,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumPost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ForumLike" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "profileId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumLike_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ForumLike_postId_profileId_key" ON "ForumLike"("postId", "profileId");

CREATE TABLE "ForumComment" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "profileId" INTEGER,
    "authorName" TEXT NOT NULL,
    "authorAvatar" TEXT,
    "isAdminComment" BOOLEAN NOT NULL DEFAULT false,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumComment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Activity" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "attachmentUrl" TEXT,
    "attachmentName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ActivitySubmission" (
    "id" SERIAL NOT NULL,
    "activityId" INTEGER NOT NULL,
    "profileId" INTEGER NOT NULL,
    "content" TEXT,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "status" "ActivitySubmissionStatus" NOT NULL DEFAULT 'ENVIADA',
    "feedback" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivitySubmission_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ActivitySubmission_activityId_profileId_key" ON "ActivitySubmission"("activityId", "profileId");

ALTER TABLE "ForumPost" ADD CONSTRAINT "ForumPost_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ForumLike" ADD CONSTRAINT "ForumLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ForumPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ForumLike" ADD CONSTRAINT "ForumLike_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ForumComment" ADD CONSTRAINT "ForumComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ForumPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ForumComment" ADD CONSTRAINT "ForumComment_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ActivitySubmission" ADD CONSTRAINT "ActivitySubmission_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ActivitySubmission" ADD CONSTRAINT "ActivitySubmission_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
