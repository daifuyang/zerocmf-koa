-- DropIndex
DROP INDEX `sys_operation_log_oper_id_title_business_type_oper_name_oper_idx` ON `sys_operation_log`;

-- CreateIndex
CREATE INDEX `sys_operation_log_oper_id_idx` ON `sys_operation_log`(`oper_id`);
