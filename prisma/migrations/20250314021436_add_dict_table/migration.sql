-- AlterTable
ALTER TABLE `sys_login_log` MODIFY `status` TINYINT NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE `sys_dict_type` (
    `dict_id` INTEGER NOT NULL AUTO_INCREMENT,
    `dict_name` VARCHAR(100) NOT NULL DEFAULT '',
    `dict_type` VARCHAR(100) NOT NULL DEFAULT '',
    `status` TINYINT NOT NULL DEFAULT 1,
    `remark` VARCHAR(500) NULL,
    `created_id` INTEGER NULL,
    `created_by` VARCHAR(64) NOT NULL DEFAULT '',
    `created_at` INTEGER NULL,
    `updated_id` INTEGER NULL,
    `updated_by` VARCHAR(64) NOT NULL DEFAULT '',
    `updated_at` INTEGER NULL,
    `deleted_at` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `sys_dict_type_dict_type_key`(`dict_type`),
    INDEX `sys_dict_type_dict_id_dict_type_idx`(`dict_id`, `dict_type`),
    PRIMARY KEY (`dict_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_dict_data` (
    `dict_code` INTEGER NOT NULL AUTO_INCREMENT,
    `dict_sort` INTEGER NOT NULL DEFAULT 0,
    `dict_label` VARCHAR(100) NOT NULL DEFAULT '',
    `dict_value` VARCHAR(100) NOT NULL DEFAULT '',
    `dict_type` VARCHAR(100) NOT NULL DEFAULT '',
    `css_class` VARCHAR(100) NULL,
    `list_class` VARCHAR(100) NULL,
    `is_default` TINYINT NOT NULL DEFAULT 0,
    `status` TINYINT NOT NULL DEFAULT 1,
    `remark` VARCHAR(500) NULL,
    `created_id` INTEGER NULL,
    `created_by` VARCHAR(64) NOT NULL DEFAULT '',
    `created_at` INTEGER NULL,
    `updated_id` INTEGER NULL,
    `updated_by` VARCHAR(64) NOT NULL DEFAULT '',
    `updated_at` INTEGER NULL,
    `deleted_at` INTEGER NOT NULL DEFAULT 0,

    INDEX `sys_dict_data_dict_code_dict_type_idx`(`dict_code`, `dict_type`),
    PRIMARY KEY (`dict_code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
