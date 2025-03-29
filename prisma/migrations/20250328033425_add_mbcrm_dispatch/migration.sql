-- CreateTable
CREATE TABLE `mbcrm_dispatch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dispatch_no` VARCHAR(191) NOT NULL,
    `hospital_id` INTEGER NOT NULL,
    `customer_id` INTEGER NOT NULL,
    `project` VARCHAR(100) NOT NULL,
    `dispatch_time` INTEGER NOT NULL DEFAULT 0,
    `dispatcher_id` INTEGER NOT NULL,
    `status` TINYINT NOT NULL DEFAULT 0,
    `message` TEXT NULL,
    `created_id` INTEGER NOT NULL,
    `created_by` VARCHAR(64) NOT NULL DEFAULT '',
    `created_at` INTEGER NOT NULL DEFAULT 0,
    `updated_id` INTEGER NOT NULL DEFAULT 0,
    `updated_by` VARCHAR(64) NOT NULL DEFAULT '',
    `updated_at` INTEGER NULL,
    `deleted_at` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `mbcrm_dispatch_dispatch_no_key`(`dispatch_no`),
    INDEX `mbcrm_dispatch_hospital_id_customer_id_dispatcher_id_status_idx`(`hospital_id`, `customer_id`, `dispatcher_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `mbcrm_dispatch` ADD CONSTRAINT `mbcrm_dispatch_hospital_id_fkey` FOREIGN KEY (`hospital_id`) REFERENCES `mbcrm_hospital`(`hospital_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mbcrm_dispatch` ADD CONSTRAINT `mbcrm_dispatch_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `mbcrm_customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mbcrm_dispatch` ADD CONSTRAINT `mbcrm_dispatch_dispatcher_id_fkey` FOREIGN KEY (`dispatcher_id`) REFERENCES `sys_user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
