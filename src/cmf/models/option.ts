import redis from "@/lib/redis";
import prisma from "@/lib/prisma";
import { serializeData } from "@/lib/utils";

// 根据name获取value
const optionNameKey = "option:name:";

// 获取option值
export async function getOptionValue(name: string, tx = prisma) {
  const key = `${optionNameKey}${name}`;
  const cache = await redis.get(key);
  if (cache) {
    return JSON.parse(cache);
  }
  const option = await tx.sysOption.findUnique({
    where: {
      optionName: name
    }
  });

  if (option) {
    redis.set(key, serializeData(option));
  }

  return option;
}

// 设置option值
export async function setOptionValue(name: string, value: string, tx = prisma) {
  const key = `${optionNameKey}${name}`;
  const option = await tx.sysOption.upsert({
    where: {
      optionName: name
    },
    create: {
      optionName: name,
      optionValue: value
    },
    update: {
      optionValue: value
    }
  });
  if (option) {
    redis.set(key, serializeData(option));
  }
  return option;
}
