import { migrateMenu, systemMenus } from "./menu";
import cmfMigrate from "@/cmf/migrate";

function migrate(props: any = {}) {
  const { menus } = props;
  if (menus) {
    migrateMenu(menus);
  }
  return {
    migrateMenu,
    commit
  };
}

// 提交迁移
export function commit() {
  cmfMigrate({ menus: systemMenus });
}
export default migrate;
