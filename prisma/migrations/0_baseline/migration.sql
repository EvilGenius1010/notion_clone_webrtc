-- CreateTable
CREATE TABLE "PageSlices" (
    "blockid" TEXT NOT NULL,
    "pageid" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "content" TEXT,

    CONSTRAINT "PageSlices_pkey" PRIMARY KEY ("blockid")
);

-- CreateTable
CREATE TABLE "Pages" (
    "title" TEXT,
    "pageid" TEXT NOT NULL,
    "userOwner" TEXT NOT NULL,

    CONSTRAINT "Pages_pkey" PRIMARY KEY ("pageid")
);

-- CreateTable
CREATE TABLE "User" (
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("email")
);

-- CreateIndex
CREATE UNIQUE INDEX "PageSlices_pageid_order_key" ON "PageSlices"("pageid", "order");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "PageSlices" ADD CONSTRAINT "PageSlices_pageid_fkey" FOREIGN KEY ("pageid") REFERENCES "Pages"("pageid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pages" ADD CONSTRAINT "Pages_userOwner_fkey" FOREIGN KEY ("userOwner") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

