import { Context } from "koa";
import { getApisModel } from "../../models/api";
import response from "@/lib/response";

// 获取接口列表
export const getApisController = async (ctx: Context) => {
  const apis = await getApisModel();
  ctx.body = response.success("获取成功！", apis);
};
