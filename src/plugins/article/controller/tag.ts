import { parseQuery } from "@/lib/request";
import response from "@/lib/response";
import { Context } from "koa";
import { deleteTagById, getTagById, getTagCount, getTagList } from "../models/tag";

// 获取标签列表
export async function getTagListController(ctx: Context) {
  const query = ctx.query || {};
  const { current, pageSize, name } = parseQuery(query);
  const total = await getTagCount({ name: { contains: name } });
  const data = await getTagList(current, pageSize, { name: { contains: name } });
  ctx.body = response.success("获取成功！", { total, data, current, pageSize });
  return;
}

// 删除标签
export async function deleteTagController(ctx: Context) {
  const { tagId } = ctx.params;
  const tag = await getTagById(tagId);
  if (!tag) {
    ctx.body = response.error("标签不存在！");
    return;
  }
  const deleteTag = await deleteTagById(tagId);
  ctx.body = response.success("删除成功！", deleteTag);
  return;
}
