import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import { MbcrmCustomer, Prisma } from "@prisma/client";

const customerIdKey = `mbcrm:customer:`;

// 获取客户总数
export async function getCustomerCount(where: Prisma.MbcrmCustomerWhereInput = {}, tx = prisma) {
  return await tx.mbcrmCustomer.count({
    where
  });
}

// 获取客户列表
export async function getCustomerList(
  current: number,
  pageSize: number,
  where: Prisma.MbcrmCustomerWhereInput = {},
  orderBy: Prisma.MbcrmCustomerOrderByWithRelationInput = { createdAt: "desc" },
  tx = prisma
) {
  const args = {
    skip: pageSize !== 0 ? (current - 1) * pageSize : undefined,
    take: pageSize !== 0 ? pageSize : undefined,
    where,
    orderBy
  };

  return await tx.mbcrmCustomer.findMany(args);
}

// 根据ID获取客户
export async function getCustomerById(customerId: number, tx = prisma) {
  const cacheKey = customerIdKey + customerId;
  const cache = await redis.get(cacheKey);

  let customer: MbcrmCustomer | null = null;
  if (cache) {
    customer = JSON.parse(cache);
  } else {
    customer = await tx.mbcrmCustomer.findUnique({
      where: { customerId }
    });

    if (customer) {
      redis.set(cacheKey, JSON.stringify(customer));
    }
  }
  return customer;
}

// 根据会员编号获取客户
export async function getCustomerByMemberNo(memberNo: string, tx = prisma) {
  return await tx.mbcrmCustomer.findFirst({
    where: {
      memberNo: {
        equals: memberNo
      }
    }
  });
}

// 创建客户
export async function createCustomer(
  data: Prisma.MbcrmCustomerCreateInput,
  tx = prisma
) {
  return await tx.mbcrmCustomer.create({
    data
  });
}

// 更新客户
export async function updateCustomer(
  customerId: number,
  data: Prisma.MbcrmCustomerUpdateInput,
  tx = prisma
) {
  const result = await tx.mbcrmCustomer.update({
    where: { customerId },
    data
  });

  if (result) {
    const cacheKey = customerIdKey + customerId;
    redis.del(cacheKey);
  }

  return result;
}

// 更新客户状态
export async function updateCustomerStatus(
  customerId: number,
  status: number,
  tx = prisma
) {
  return updateCustomer(customerId, { status }, tx);
}

// 获取客户状态选项
export function getCustomerStatusOptions() {
  return [
    { value: 0, label: "资料录入" },
    { value: 1, label: "待跟进" },
    { value: 2, label: "重单" },
    { value: 3, label: "已手术" },
    { value: 4, label: "无效用户" }
  ];
}

// 删除客户
export async function deleteCustomer(customerId: number, tx = prisma) {
  const result = await tx.mbcrmCustomer.delete({
    where: { customerId }
  });

  if (result) {
    const cacheKey = customerIdKey + customerId;
    redis.del(cacheKey);
  }

  return result;
}
