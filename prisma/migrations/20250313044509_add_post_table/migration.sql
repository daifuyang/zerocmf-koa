-- CreateTable
CREATE TABLE `sys_post` (
    `post_id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_code` VARCHAR(64) NOT NULL,
    `post_name` VARCHAR(50) NOT NULL,
    `sort_order` TINYINT NOT NULL DEFAULT 1,
    `status` TINYINT NOT NULL DEFAULT 1,
    `remark` VARCHAR(500) NOT NULL DEFAULT '',
    `created_id` INTEGER NULL,
    `created_by` VARCHAR(64) NOT NULL DEFAULT '',
    `created_at` INTEGER NULL,
    `updated_id` INTEGER NULL,
    `updated_by` VARCHAR(64) NOT NULL DEFAULT '',
    `updated_at` INTEGER NULL,
    `deleted_at` INTEGER NOT NULL DEFAULT 0,

    INDEX `sys_post_post_id_post_code_post_name_idx`(`post_id`, `post_code`, `post_name`),
    PRIMARY KEY (`post_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_user_post` (
    `user_id` INTEGER NOT NULL,
    `post_id` INTEGER NOT NULL,

    UNIQUE INDEX `sys_user_post_user_id_post_id_key`(`user_id`, `post_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
