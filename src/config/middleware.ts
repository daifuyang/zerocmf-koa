import { Middleware } from 'koa';

export interface MiddlewareConfig {
  name: string;
  enable: boolean;
  options?: Record<string, unknown>;
  order: number;
  description?: string;
}

export interface MiddlewareSpec {
  name: string;
  middleware: Middleware;
  config?: MiddlewareConfig;
}
