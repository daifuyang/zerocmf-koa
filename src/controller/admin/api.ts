import { Context } from "koa";
import response from "@/lib/response";

// 获取接口列表
export const getApisController = async (ctx: Context) => {
  ctx.body = response.success("获取接口列表成功！");
};
