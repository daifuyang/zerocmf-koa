import { Redis } from "ioredis";

const {REDIS_URL} = process.env

let redis: Redis |  null = null;
if (REDIS_URL) {
  redis = new Redis(REDIS_URL);
}

const get = (key: string) => {
  if (!redis) return null;
  const appName = process.env.APP_NAME || "nextcms";
  return redis.get(appName + ":" + key);
};

const set = (key: string, value: string) => {
  if (!redis) return null;
  const appName = process.env.APP_NAME || "nextcms";
  return redis.set(appName + ":" + key, value);
};

const del = (key: string) => {
  if (!redis) return null;
  const appName = process.env.APP_NAME || "nextcms";
  return redis.del(appName + ":" + key);
}

export default {
  get,
  set,
  del
};
