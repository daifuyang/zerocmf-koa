import Router from "koa-router";
import { migrateMenu, systemMenus } from "./menu";
import cmfMigrate from "@/cmf/migrate";

// 定义Props
interface MigrateProps {
  menus: any;
  router: Router;
}

export type Migrate = (props: MigrateProps) => void;

function migrate(props: MigrateProps) {
  const { menus, router } = props;
  if (menus) {
    migrateMenu(menus);
  }
  cmfMigrate({ menus: systemMenus, router });
}
export default migrate;
