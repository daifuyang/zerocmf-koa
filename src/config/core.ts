import { z } from 'zod';

// 基础配置Schema
const CoreConfigSchema = z.object({
  appName: z.string().default('ZeroCMF'),
  baseUrl: z.string().url().default('http://localhost'),
  timezone: z.string().default('Asia/Shanghai'),
  uploadDir: z.string().min(1),
  staticDir: z.string().default('/public')
});

export type CoreConfig = z.infer<typeof CoreConfigSchema>;

export const createCoreConfig = (): CoreConfig => ({
  appName: 'ZeroCMF',
  baseUrl: 'http://localhost',
  timezone: 'Asia/Shanghai',
  uploadDir: '/tmp/uploads',
  staticDir: '/public' 
});
