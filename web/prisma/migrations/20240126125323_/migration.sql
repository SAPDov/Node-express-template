/*
  Warnings:

  - The primary key for the `save_later_cart` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Made the column `created_at` on table `save_later_cart` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `save_later_cart` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD PRIMARY KEY (`id`);
