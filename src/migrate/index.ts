import Router from "koa-router";
import { migrateMenu, systemMenus } from "./menu";
import cmfMigrate from "@/cmf/migrate";

// 定义Props
interface MigrateProps {
  menus?: any;
}

export type Migrate = (props?: MigrateProps) => {
  commit: (router: Router) => void;
};

function migrate(props: MigrateProps = {}) {
  const { menus } = props;
  if (menus) {
    migrateMenu(menus);
  }
  const commit = (router: Router) => {
    cmfMigrate({ menus: systemMenus, router });
  }

  return {
    commit
  }

}
export default migrate;
