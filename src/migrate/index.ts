import Router from "koa-router";
import migrateMenu from "./menu";
import { systemMenus } from "./menu";
import cmfMigrate from "@/cmf/migrate";

// 定义Props
interface MigrateProps {
  menus?: any;
}

export type Migrate = (props?: MigrateProps) => {
  commit: () => void;
};


function migrate(props: MigrateProps = {}) {
  const { menus } = props;
  if (menus) {
    migrateMenu(menus);
  }
  const commit = () => {
    cmfMigrate({ menus: systemMenus, router: this.router });
  }

  return {
    commit
  }
}
export default migrate;
