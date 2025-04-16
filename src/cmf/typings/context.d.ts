import { Cmf } from './index';
import { AppConfig } from '../../config/app';

declare module 'koa' {
  interface BaseContext {
    cmf: Cmf;
    config: AppConfig;
    user?: {
      id: string;
      roles: string[];
    };
  }

  interface Request {
    body?: unknown;
    files?: unknown;
  }
}
