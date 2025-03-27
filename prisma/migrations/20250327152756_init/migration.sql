/*
  Warnings:

  - Made the column `created_at` on table `mbcrm_hospital` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `mbcrm_hospital` MODIFY `created_at` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `sys_user` MODIFY `created_at` INTEGER NOT NULL DEFAULT 0;
