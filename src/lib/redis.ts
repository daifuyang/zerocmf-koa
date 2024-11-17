import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

const get = (key: string) => {
  const appName = process.env.APP_NAME || "nextcms";
  return redis.get(appName + ":" + key);
};

const set = (key: string, value: string) => {
  const appName = process.env.APP_NAME || "nextcms";
  return redis.set(appName + ":" + key, value);
};

const del = (key: string) => {
  const appName = process.env.APP_NAME || "nextcms";
  return redis.del(appName + ":" + key);
}

export default {
  get,
  set,
  del
};
