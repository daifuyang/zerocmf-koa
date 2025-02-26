import migrateUser from "./user";
import migrateMenu from "./menu";
import migrateRole from "./role";
import migrateApi from "./api";
import migrateOption from "./sysOption";
export default async function migrate(props: any) {
  const { menus } = props;
  migrateUser();
  migrateRole();
  migrateMenu(menus);
  migrateApi();
  migrateOption();
}
