import { z } from 'zod';
import { CoreConfig } from './core';

const EnvSchema = z.object({
  PORT: z.string().regex(/^\d+$/).default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url()
});

export const loadEnvConfig = (core: CoreConfig) => {
  const env = EnvSchema.parse(process.env);
  
  return {
    port: parseInt(env.PORT, 10),
    env: env.NODE_ENV,
    dbUrl: env.DATABASE_URL,
    isProd: env.NODE_ENV === 'production',
    uploadDir: core.uploadDir
  };
};
