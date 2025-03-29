/*
  Warnings:

  - You are about to drop the column `birthDate` on the `mbcrm_customer` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `mbcrm_customer` table. All the data in the column will be lost.
  - You are about to drop the column `operatorId` on the `mbcrm_customer` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `mbcrm_customer` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `mbcrm_customer` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `gender` on the `mbcrm_customer` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(10)`.
  - You are about to alter the column `province` on the `mbcrm_customer` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `city` on the `mbcrm_customer` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `district` on the `mbcrm_customer` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `phone` on the `mbcrm_customer` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - You are about to alter the column `mobile` on the `mbcrm_customer` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - You are about to alter the column `wechat` on the `mbcrm_customer` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `qq` on the `mbcrm_customer` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - You are about to alter the column `project` on the `mbcrm_customer` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - A unique constraint covering the columns `[member_no]` on the table `mbcrm_customer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `birth_date` to the `mbcrm_customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_id` to the `mbcrm_customer` table without a default value. This is not possible if the table is not empty.
  - The required column `member_no` was added to the `mbcrm_customer` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE `mbcrm_customer` DROP FOREIGN KEY `mbcrm_customer_operatorId_fkey`;

-- DropIndex
DROP INDEX `mbcrm_customer_operatorId_idx` ON `mbcrm_customer`;

-- AlterTable
ALTER TABLE `mbcrm_customer` DROP COLUMN `birthDate`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `operatorId`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `birth_date` DATETIME(3) NOT NULL,
    ADD COLUMN `created_at` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `created_by` VARCHAR(64) NOT NULL DEFAULT '',
    ADD COLUMN `created_id` INTEGER NOT NULL,
    ADD COLUMN `deleted_at` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `member_no` VARCHAR(191) NOT NULL,
    ADD COLUMN `operator_id` INTEGER NULL,
    ADD COLUMN `updated_at` INTEGER NULL,
    ADD COLUMN `updated_by` VARCHAR(64) NOT NULL DEFAULT '',
    ADD COLUMN `updated_id` INTEGER NOT NULL DEFAULT 0,
    MODIFY `name` VARCHAR(50) NOT NULL,
    MODIFY `gender` VARCHAR(10) NOT NULL,
    MODIFY `province` VARCHAR(50) NOT NULL,
    MODIFY `city` VARCHAR(50) NOT NULL,
    MODIFY `district` VARCHAR(50) NOT NULL,
    MODIFY `address` VARCHAR(200) NOT NULL,
    MODIFY `phone` VARCHAR(20) NULL,
    MODIFY `mobile` VARCHAR(20) NULL,
    MODIFY `wechat` VARCHAR(50) NULL,
    MODIFY `qq` VARCHAR(20) NULL,
    MODIFY `project` VARCHAR(100) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `mbcrm_customer_member_no_key` ON `mbcrm_customer`(`member_no`);

-- CreateIndex
CREATE INDEX `mbcrm_customer_operator_id_member_no_status_idx` ON `mbcrm_customer`(`operator_id`, `member_no`, `status`);

-- AddForeignKey
ALTER TABLE `mbcrm_customer` ADD CONSTRAINT `mbcrm_customer_operator_id_fkey` FOREIGN KEY (`operator_id`) REFERENCES `sys_user`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;
