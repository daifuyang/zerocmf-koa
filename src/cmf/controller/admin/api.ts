import { Context } from "koa";
import { getApis } from "../../models/api";
import response from "@/lib/response";

// 获取接口列表
export const getApisController = async (ctx: Context) => {
  const apis = await getApis();
  ctx.body = response.success("获取成功！", apis);
};
