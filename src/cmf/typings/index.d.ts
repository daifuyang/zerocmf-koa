import { Router } from 'koa-router';
import Koa from 'koa';
import { RouteSpec, RouterModule } from './router';

export interface Cmf {
  app: Koa;
  router: Router;
  migrate: (() => {
    commit: () => void;
  }) | null;
}

export interface Plugin {
  name: string;
  config?: Record<string, unknown>;
  install: (cmf: Cmf) => void;
}

export type { RouteSpec, RouterModule };
