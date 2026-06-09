-- CreateTable
CREATE TABLE "news_images" (
    "id" SERIAL NOT NULL,
    "news_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "is_main" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "news_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "news_images" ADD CONSTRAINT "news_images_news_id_fkey" FOREIGN KEY ("news_id") REFERENCES "news"("id") ON DELETE CASCADE ON UPDATE CASCADE;
