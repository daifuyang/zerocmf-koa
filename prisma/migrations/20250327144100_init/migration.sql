/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `mbcrm_hospital` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `mbcrm_hospital_user_id_key` ON `mbcrm_hospital`(`user_id`);

-- AddForeignKey
ALTER TABLE `mbcrm_hospital` ADD CONSTRAINT `mbcrm_hospital_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `sys_user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
