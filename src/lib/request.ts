import { Context } from "koa";
import { ParsedUrlQuery } from "querystring";

export const parseJson = <T = any>(ctx: Context): T => {
  return (ctx.request.body || {}) as T;
};

export const parseQuery = (query: ParsedUrlQuery): { [key: string]: any } => {
  const { current, pageSize, ...rest } = query;
  return {
    current: current != null ? Number(current) : 1,
    pageSize: pageSize != null ? Number(pageSize) : 10,
    ...rest
  };
};
