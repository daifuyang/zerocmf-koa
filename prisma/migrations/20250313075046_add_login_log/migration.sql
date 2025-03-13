-- CreateTable
CREATE TABLE `sys_login_log` (
    `info_id` INTEGER NOT NULL AUTO_INCREMENT,
    `login_name` VARCHAR(50) NULL,
    `ipaddr` VARCHAR(128) NULL,
    `login_location` VARCHAR(255) NULL,
    `browser` VARCHAR(50) NULL,
    `os` VARCHAR(50) NULL,
    `status` TINYINT NOT NULL DEFAULT 0,
    `msg` VARCHAR(255) NULL,
    `login_time` INTEGER NULL,
    `user_id` INTEGER NULL,

    INDEX `sys_login_log_info_id_login_name_ipaddr_status_login_time_idx`(`info_id`, `login_name`, `ipaddr`, `status`, `login_time`),
    PRIMARY KEY (`info_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
