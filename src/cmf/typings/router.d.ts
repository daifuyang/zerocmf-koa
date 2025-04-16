import { Context } from 'koa';
import { AppConfig } from '../../config/app';

type RouteHandler<T = any> = (
  ctx: Context & {
    config: AppConfig;
    request: {
      body: T;
      files?: any;
    };
  }
) => Promise<void>;

export interface RouteSpec<T = any> {
  method: 'get' | 'post' | 'put' | 'delete';
  path: string;
  handler: RouteHandler<T>;
  middlewares?: Array<(ctx: Context, next: () => Promise<void>) => Promise<void>>;
}

export interface RouterModule {
  prefix?: string;
  routes: RouteSpec[];
}
