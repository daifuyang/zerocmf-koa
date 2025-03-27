/*
  Warnings:

  - You are about to drop the `sys_hospital` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `sys_hospital`;

-- CreateTable
CREATE TABLE `crm_hospital` (
    `hospital_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `hospital_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NULL,
    `province` VARCHAR(50) NULL,
    `city` VARCHAR(50) NULL,
    `district` VARCHAR(50) NULL,
    `address` VARCHAR(200) NULL,
    `phone` VARCHAR(20) NULL,
    `avg_price` DECIMAL(10, 2) NULL,
    `website` VARCHAR(100) NULL,
    `hospital_type` TINYINT NOT NULL DEFAULT 0,
    `contact_name` VARCHAR(50) NULL,
    `contact_phone` VARCHAR(20) NULL,
    `contact_qq` VARCHAR(20) NULL,
    `contact_wechat` VARCHAR(50) NULL,
    `front_name` VARCHAR(50) NULL,
    `front_phone` VARCHAR(20) NULL,
    `front_qq` VARCHAR(20) NULL,
    `front_wechat` VARCHAR(50) NULL,
    `bus_station` VARCHAR(100) NULL,
    `bus_route` TEXT NULL,
    `metro_station` VARCHAR(100) NULL,
    `metro_route` TEXT NULL,
    `member_discount` TEXT NULL,
    `rebate` DECIMAL(5, 2) NULL,
    `introduction` TEXT NULL,
    `status` TINYINT NOT NULL DEFAULT 1,
    `created_id` INTEGER NULL,
    `created_by` VARCHAR(64) NOT NULL DEFAULT '',
    `created_at` INTEGER NULL,
    `updated_id` INTEGER NULL,
    `updated_by` VARCHAR(64) NOT NULL DEFAULT '',
    `updated_at` INTEGER NULL,
    `deleted_at` INTEGER NOT NULL DEFAULT 0,

    INDEX `crm_hospital_hospital_id_user_id_hospital_name_idx`(`hospital_id`, `user_id`, `hospital_name`),
    PRIMARY KEY (`hospital_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
