-- CreateTable
CREATE TABLE `sys_operation_log` (
    `oper_id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(50) NULL,
    `business_type` INTEGER NOT NULL DEFAULT 0,
    `method` VARCHAR(100) NULL,
    `request_method` VARCHAR(10) NULL,
    `operator_type` INTEGER NOT NULL DEFAULT 0,
    `oper_name` VARCHAR(50) NULL,
    `dept_name` VARCHAR(50) NULL,
    `oper_url` VARCHAR(255) NULL,
    `oper_ip` VARCHAR(128) NULL,
    `oper_location` VARCHAR(255) NULL,
    `oper_param` TEXT NULL,
    `json_result` TEXT NULL,
    `status` TINYINT NOT NULL DEFAULT 1,
    `error_msg` TEXT NULL,
    `oper_time` INTEGER NULL,
    `user_id` INTEGER NULL,

    INDEX `sys_operation_log_oper_id_title_business_type_oper_name_oper_idx`(`oper_id`, `title`, `business_type`, `oper_name`, `oper_time`),
    PRIMARY KEY (`oper_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
