-- CreateTable
CREATE TABLE `cms_article` (
    `article` INTEGER NOT NULL AUTO_INCREMENT,
    `post_format` TINYINT NULL DEFAULT 1,
    `seo_title` VARCHAR(100) NULL,
    `seo_keywords` VARCHAR(255) NULL,
    `seo_description` VARCHAR(255) NULL,
    `thumbnail` VARCHAR(255) NULL,
    `title` VARCHAR(100) NOT NULL,
    `content` LONGTEXT NULL,
    `keywords` VARCHAR(255) NULL,
    `excerpt` VARCHAR(255) NULL,
    `author` VARCHAR(50) NULL,
    `source` VARCHAR(255) NULL,
    `is_top` TINYINT NULL,
    `hits` INTEGER NULL,
    `favorites` INTEGER NULL,
    `likes` INTEGER NULL,
    `comments` INTEGER NULL,
    `more` JSON NULL,
    `article_status` TINYINT NULL DEFAULT 1,
    `comment_status` TINYINT NULL DEFAULT 1,
    `order` INTEGER NULL,
    `published_at` INTEGER NULL,
    `create_id` INTEGER NOT NULL,
    `creator` VARCHAR(50) NOT NULL,
    `update_id` INTEGER NOT NULL,
    `updater` VARCHAR(50) NOT NULL,
    `created_at` INTEGER NOT NULL,
    `updated_at` INTEGER NOT NULL,
    `deleted_at` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`article`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cms_article_category` (
    `articleCategoryId` INTEGER NOT NULL AUTO_INCREMENT,
    `parent_id` INTEGER NOT NULL,
    `seo_title` VARCHAR(100) NULL,
    `seo_keywords` VARCHAR(255) NULL,
    `seo_description` VARCHAR(255) NULL,
    `name` VARCHAR(100) NOT NULL,
    `icon` VARCHAR(255) NULL,
    `description` VARCHAR(255) NULL,
    `status` TINYINT NULL DEFAULT 1,
    `article_count` INTEGER NOT NULL,
    `path` VARCHAR(255) NOT NULL,
    `order` INTEGER NULL,
    `create_id` INTEGER NOT NULL,
    `creator` VARCHAR(50) NOT NULL,
    `update_id` INTEGER NOT NULL,
    `updater` VARCHAR(50) NOT NULL,
    `created_at` INTEGER NOT NULL,
    `updated_at` INTEGER NOT NULL,
    `deleted_at` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`articleCategoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cms_article_category_post` (
    `article_id` INTEGER NOT NULL,
    `article_category_id` INTEGER NOT NULL,
    `order` INTEGER NULL,

    UNIQUE INDEX `cms_article_category_post_article_id_article_category_id_key`(`article_id`, `article_category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cms_article_tag` (
    `tagId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `article_count` INTEGER NOT NULL,

    UNIQUE INDEX `cms_article_tag_name_key`(`name`),
    PRIMARY KEY (`tagId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cms_article_tag_post` (
    `article_id` INTEGER NOT NULL,
    `tag_id` INTEGER NOT NULL,

    UNIQUE INDEX `cms_article_tag_post_article_id_tag_id_key`(`article_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_user` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `login_name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `salt` VARCHAR(191) NULL,
    `nickname` VARCHAR(191) NULL,
    `realname` VARCHAR(191) NULL,
    `gender` TINYINT NOT NULL DEFAULT 0,
    `birthday` INTEGER NULL,
    `user_type` TINYINT NOT NULL DEFAULT 0,
    `avatar` VARCHAR(191) NULL,
    `login_ip` VARCHAR(191) NULL,
    `login_at` INTEGER NULL,
    `status` TINYINT NOT NULL DEFAULT 1,
    `remark` VARCHAR(500) NOT NULL DEFAULT '',
    `created_at` INTEGER NOT NULL,
    `updated_at` INTEGER NOT NULL,
    `deleted_at` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `sys_user_login_name_key`(`login_name`),
    UNIQUE INDEX `sys_user_email_key`(`email`),
    UNIQUE INDEX `sys_user_phone_key`(`phone`),
    INDEX `sys_user_user_id_login_name_phone_email_idx`(`user_id`, `login_name`, `phone`, `email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_user_token` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `access_token` VARCHAR(191) NOT NULL,
    `expires_at` INTEGER NOT NULL,
    `refresh_token` VARCHAR(191) NOT NULL,
    `re_expires_at` INTEGER NOT NULL,

    UNIQUE INDEX `sys_user_token_access_token_key`(`access_token`),
    UNIQUE INDEX `sys_user_token_refresh_token_key`(`refresh_token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_role` (
    `roleId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `sort_order` TINYINT NOT NULL DEFAULT 1,
    `status` TINYINT NOT NULL DEFAULT 1,
    `create_at` INTEGER NOT NULL,
    `update_at` INTEGER NOT NULL,
    `delete_at` INTEGER NOT NULL DEFAULT 0,

    INDEX `sys_role_roleId_name_idx`(`roleId`, `name`),
    PRIMARY KEY (`roleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_option` (
    `option_name` VARCHAR(64) NOT NULL,
    `option_value` TEXT NOT NULL,

    UNIQUE INDEX `sys_option_option_name_key`(`option_name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_menu` (
    `menu_id` INTEGER NOT NULL AUTO_INCREMENT,
    `menu_name` VARCHAR(50) NOT NULL,
    `parent_id` INTEGER NOT NULL DEFAULT 0,
    `sort_order` TINYINT NOT NULL DEFAULT 1,
    `path` VARCHAR(200) NOT NULL DEFAULT '',
    `component` VARCHAR(255) NULL,
    `query` VARCHAR(255) NULL,
    `is_frame` INTEGER NOT NULL DEFAULT 0,
    `is_cache` INTEGER NOT NULL DEFAULT 0,
    `menu_type` TINYINT NOT NULL DEFAULT 0,
    `visible` TINYINT NOT NULL DEFAULT 1,
    `status` TINYINT NOT NULL DEFAULT 1,
    `perms` VARCHAR(100) NULL,
    `icon` VARCHAR(100) NOT NULL,
    `created_id` INTEGER NULL,
    `created_by` VARCHAR(64) NOT NULL DEFAULT '',
    `created_at` INTEGER NULL,
    `updated_id` INTEGER NULL,
    `updated_by` VARCHAR(64) NOT NULL DEFAULT '',
    `updated_at` INTEGER NULL,
    `remark` VARCHAR(500) NOT NULL DEFAULT '',

    INDEX `sys_menu_menu_id_menu_name_perms_idx`(`menu_id`, `menu_name`, `perms`),
    PRIMARY KEY (`menu_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `casbin_rule` (
    `ptype` VARCHAR(191) NOT NULL,
    `v0` VARCHAR(191) NOT NULL,
    `v1` VARCHAR(191) NOT NULL,
    `v2` VARCHAR(191) NULL,
    `v3` VARCHAR(191) NULL,
    `v4` VARCHAR(191) NULL,
    `v5` VARCHAR(191) NULL,

    PRIMARY KEY (`ptype`, `v0`, `v1`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_api` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `path` VARCHAR(191) NOT NULL,
    `method` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `group` VARCHAR(191) NULL,

    UNIQUE INDEX `sys_api_path_method_key`(`path`, `method`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_menu_api` (
    `menu_id` INTEGER NOT NULL,
    `api_id` INTEGER NOT NULL,

    UNIQUE INDEX `sys_menu_api_menu_id_api_id_key`(`menu_id`, `api_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_media` (
    `media_id` INTEGER NOT NULL AUTO_INCREMENT,
    `file_size` BIGINT NOT NULL,
    `file_key` VARCHAR(64) NOT NULL,
    `remark_name` VARCHAR(100) NOT NULL,
    `file_name` VARCHAR(100) NOT NULL,
    `file_path` VARCHAR(100) NOT NULL,
    `resolution` VARCHAR(32) NULL,
    `file_md5` VARCHAR(32) NOT NULL,
    `file_sha1` VARCHAR(40) NOT NULL,
    `extension` VARCHAR(10) NOT NULL,
    `mimetype` VARCHAR(100) NOT NULL,
    `media_type` TINYINT NOT NULL,
    `status` TINYINT NOT NULL DEFAULT 1,
    `category_id` INTEGER NULL,
    `created_id` INTEGER NULL,
    `created_by` VARCHAR(64) NOT NULL DEFAULT '',
    `created_at` INTEGER NULL,
    `delete_at` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`media_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_media_category` (
    `category_id` INTEGER NOT NULL AUTO_INCREMENT,
    `parent_id` INTEGER NOT NULL DEFAULT 0,
    `name` VARCHAR(50) NOT NULL,
    `sort_order` TINYINT NOT NULL DEFAULT 1,
    `status` TINYINT NOT NULL DEFAULT 1,
    `created_id` INTEGER NULL,
    `created_by` VARCHAR(64) NOT NULL DEFAULT '',
    `created_at` INTEGER NULL,
    `updated_id` INTEGER NULL,
    `updated_by` VARCHAR(64) NOT NULL DEFAULT '',
    `updated_at` INTEGER NULL,
    `delete_at` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_dept` (
    `dept_id` INTEGER NOT NULL AUTO_INCREMENT,
    `parent_id` INTEGER NOT NULL DEFAULT 0,
    `ancestors` VARCHAR(255) NULL,
    `dept_name` VARCHAR(50) NOT NULL,
    `sort_order` TINYINT NOT NULL DEFAULT 1,
    `leader` VARCHAR(20) NULL,
    `phone` VARCHAR(11) NULL,
    `email` VARCHAR(50) NULL,
    `status` TINYINT NOT NULL DEFAULT 1,
    `created_id` INTEGER NULL,
    `created_by` VARCHAR(64) NOT NULL DEFAULT '',
    `created_at` INTEGER NULL,
    `updated_id` INTEGER NULL,
    `updated_by` VARCHAR(64) NOT NULL DEFAULT '',
    `updated_at` INTEGER NULL,
    `deleted_at` INTEGER NOT NULL DEFAULT 0,

    INDEX `sys_dept_dept_id_parent_id_dept_name_idx`(`dept_id`, `parent_id`, `dept_name`),
    PRIMARY KEY (`dept_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_user_dept` (
    `user_id` INTEGER NOT NULL,
    `dept_id` INTEGER NOT NULL,

    UNIQUE INDEX `sys_user_dept_user_id_dept_id_key`(`user_id`, `dept_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cms_article_category_post` ADD CONSTRAINT `cms_article_category_post_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `cms_article`(`article`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cms_article_category_post` ADD CONSTRAINT `cms_article_category_post_article_category_id_fkey` FOREIGN KEY (`article_category_id`) REFERENCES `cms_article_category`(`articleCategoryId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cms_article_tag_post` ADD CONSTRAINT `cms_article_tag_post_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `cms_article`(`article`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cms_article_tag_post` ADD CONSTRAINT `cms_article_tag_post_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `cms_article_tag`(`tagId`) ON DELETE RESTRICT ON UPDATE CASCADE;
