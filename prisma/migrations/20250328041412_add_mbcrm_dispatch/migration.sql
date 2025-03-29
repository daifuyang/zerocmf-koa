/*
  Warnings:

  - The primary key for the `mbcrm_customer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `mbcrm_customer` table. All the data in the column will be lost.
  - The primary key for the `mbcrm_dispatch` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `mbcrm_dispatch` table. All the data in the column will be lost.
  - Added the required column `customerId` to the `mbcrm_customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dispatchId` to the `mbcrm_dispatch` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `mbcrm_dispatch` DROP FOREIGN KEY `mbcrm_dispatch_customer_id_fkey`;

-- DropIndex
DROP INDEX `mbcrm_dispatch_customer_id_fkey` ON `mbcrm_dispatch`;

-- AlterTable
ALTER TABLE `mbcrm_customer` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `customerId` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`customerId`);

-- AlterTable
ALTER TABLE `mbcrm_dispatch` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `dispatchId` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`dispatchId`);

-- AddForeignKey
ALTER TABLE `mbcrm_dispatch` ADD CONSTRAINT `mbcrm_dispatch_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `mbcrm_customer`(`customerId`) ON DELETE RESTRICT ON UPDATE CASCADE;
