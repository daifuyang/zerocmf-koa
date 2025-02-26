import { RBAC_MODEL } from "@/constants/path";
import { newEnforcer } from "casbin";
import type { Enforcer } from "casbin";
import { PrismaAdapter } from "casbin-prisma-adapter";

let enforcer: Enforcer;
export async function getEnforcer() {
  const a = await PrismaAdapter.newAdapter();
  if (!enforcer) {
    enforcer = await newEnforcer(RBAC_MODEL, a);
  }
  return enforcer;
}
