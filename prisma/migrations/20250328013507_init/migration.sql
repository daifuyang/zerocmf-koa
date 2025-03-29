-- CreateTable
CREATE TABLE `mbcrm_customer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `birthDate` DATETIME(3) NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `province` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `district` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `mobile` VARCHAR(191) NULL,
    `wechat` VARCHAR(191) NULL,
    `qq` VARCHAR(191) NULL,
    `project` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `remark` TEXT NULL,
    `operatorId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `mbcrm_customer_operatorId_idx`(`operatorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `mbcrm_customer` ADD CONSTRAINT `mbcrm_customer_operatorId_fkey` FOREIGN KEY (`operatorId`) REFERENCES `sys_user`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;
