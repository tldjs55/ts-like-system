/*
  Warnings:

  - You are about to drop the `like_records` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `post_stats` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `like_records`;

-- DropTable
DROP TABLE `post_stats`;

-- CreateTable
CREATE TABLE `LikeRecord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `post_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `LikeRecord_user_id_post_id_key`(`user_id`, `post_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PostStats` (
    `post_id` VARCHAR(191) NOT NULL,
    `like_count` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`post_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
