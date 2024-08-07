-- CreateTable
CREATE TABLE "PageBlock" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "PageBlock_pkey" PRIMARY KEY ("id")
);
