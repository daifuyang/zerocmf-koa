import { now } from "@/lib/date";
import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import { serializeData } from "@/lib/utils";
import { MbcrmHospital, Prisma } from "@prisma/client";

const hospitalIdKey = "hospital:id:";

// 根据id获取医院
export const getHospitalById = async (
  hospitalId: number,
  options: {
    include?: Prisma.MbcrmHospitalInclude;
  } = {},
  tx = prisma
) => {
  const { include } = options;
  const cache = await redis.get(`${hospitalIdKey}${hospitalId}`);
  let hospital: MbcrmHospital | null = null;
  if (cache) {
    hospital = JSON.parse(cache);
  }

  if (!hospital) {
    hospital = await tx.mbcrmHospital.findUnique({
      where: {
        hospitalId,
        deletedAt: 0
      },
      include
    });

    if (hospital) {
      redis.set(`${hospitalIdKey}${hospitalId}`, serializeData(hospital));
    }
  }

  return hospital;
};

// 获取医院总数
export const getHospitalCount = async (where: Prisma.MbcrmHospitalWhereInput = {}, tx = prisma) => {
  return await tx.mbcrmHospital.count({
    where: {
      ...where,
      deletedAt: 0
    }
  });
};

// 获取医院列表
export const getHospitalList = async (
  where: Prisma.MbcrmHospitalWhereInput = {},
  page: number = 1,
  pageSize: number = 10,
  tx = prisma
) => {
  const args: {
    skip?: number;
    take?: number;
    where?: Prisma.MbcrmHospitalWhereInput;
    orderBy?: Prisma.MbcrmHospitalOrderByWithRelationInput;
    include?: Prisma.MbcrmHospitalInclude;
  } =
    pageSize === 0
      ? {}
      : {
          skip: (page - 1) * pageSize,
          take: pageSize
        };

  args.where = {
    ...where,
    deletedAt: 0
  };

  args.orderBy = {
    hospitalId: "desc"
  };

  // 包含用户信息
  args.include = {
    user: {
      select: {
        userId: true,
        loginName: true,
        loginIp: true,
        loginAt: true
      }
    }
  };

  const hospitals = await tx.mbcrmHospital.findMany(args);

  return hospitals;
};

// 根据条件获取单个医院
export const getHospital = (where: Prisma.MbcrmHospitalWhereUniqueInput, tx = prisma) => {
  return tx.mbcrmHospital.findUnique({
    where
  });
};

// 创建医院
export const createHospital = async (data: Prisma.MbcrmHospitalCreateInput, tx = prisma) => {
  const hospital = await tx.mbcrmHospital.create({
    data
  });
  return hospital;
};

// 更新医院
export const updateHospital = async (
  hospitalId: number,
  data: Prisma.MbcrmHospitalUpdateInput,
  tx = prisma
) => {
  const hospital = await tx.mbcrmHospital.update({
    where: {
      hospitalId
    },
    data
  });
  if (hospital) {
    redis.del(`${hospitalIdKey}${hospitalId}`);
  }
  return hospital;
};

// 删除医院
export const deleteHospital = async (hospitalId: number, tx = prisma) => {
  const hospital = await tx.mbcrmHospital.update({
    where: {
      hospitalId
    },
    data: {
      deletedAt: now()
    }
  });
  if (hospital) {
    redis.del(`${hospitalIdKey}${hospitalId}`);
  }
  return hospital;
};
