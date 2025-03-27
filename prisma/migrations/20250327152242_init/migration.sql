/*
  Warnings:

  - Made the column `email` on table `mbcrm_hospital` required. This step will fail if there are existing NULL values in that column.
  - Made the column `province` on table `mbcrm_hospital` required. This step will fail if there are existing NULL values in that column.
  - Made the column `city` on table `mbcrm_hospital` required. This step will fail if there are existing NULL values in that column.
  - Made the column `district` on table `mbcrm_hospital` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address` on table `mbcrm_hospital` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_id` on table `mbcrm_hospital` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `mbcrm_hospital` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_id` on table `mbcrm_hospital` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `mbcrm_hospital` MODIFY `email` VARCHAR(100) NOT NULL,
    MODIFY `province` VARCHAR(50) NOT NULL,
    MODIFY `city` VARCHAR(50) NOT NULL,
    MODIFY `district` VARCHAR(50) NOT NULL,
    MODIFY `address` VARCHAR(200) NOT NULL,
    MODIFY `created_id` INTEGER NOT NULL,
    MODIFY `created_at` INTEGER NOT NULL,
    MODIFY `updated_id` INTEGER NOT NULL DEFAULT 0;
