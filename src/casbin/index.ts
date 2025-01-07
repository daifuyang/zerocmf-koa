import { newEnforcer } from "casbin";
import type { Enforcer } from "casbin";
import { PrismaAdapter } from "casbin-prisma-adapter";
import path from "path";

let enforcer: Enforcer;
export async function getEnforcer() {
  const a = await PrismaAdapter.newAdapter();
  if (!enforcer) {
    enforcer = await newEnforcer(path.join(global.ROOT_PATH, "config/casbin/rbac_model.conf"), a);
  }
  return enforcer;
}
