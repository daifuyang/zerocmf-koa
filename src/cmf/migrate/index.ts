import migrateUser from "./user";
import migrateMenu from "./menu";
import migrateRole from "./role";
import migrateApi from "./api";
import migrateOption from "./sysOption";
import migrateDict from "./dict";
import migrateDept from "./dept";
import migratePost from "./post";
export default async function migrate(props: any) {
  const { menus, router } = props;
  migrateUser();
  migrateRole();
  migrateMenu(menus);
  migrateApi(router);
  migrateOption();
  migrateDict();
  migrateDept();
  migratePost();
}
