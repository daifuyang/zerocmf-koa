import migrateUser from "./user";
import migrateMenu from "./menu";
import migrateRole from "./role";
import migrateApi from "./api";
export default async function migrate(props: any) {
  const { menus } = props;
  migrateUser();
  migrateRole();
  migrateMenu(menus);
  migrateApi();
}
