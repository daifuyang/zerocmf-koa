import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const createUserTokenModel = (data: Prisma.SysUserTokenCreateInput, tx = prisma) => {
  return tx.sysUserToken.create({
    data
  });
};
