import {
  addMediaService,
  deleteMediaService,
  getMediaListService,
  updateMediaService
} from "@/cmf/services/media";
import response from "@/lib/response";
import { Context } from "koa";
import { MediaRequest } from "@/cmf/typings/controller";

export async function getMediaListController(ctx: Context) {
  try {
    const pagination = await getMediaListService(ctx);
    ctx.body = response.success("获取成功！", pagination);
  } catch (error: any) {
    console.error("getMediaListController error:", error);
    ctx.body = response.error(`获取失败: ${error.message}`);
  }
}

export async function addMediaController(ctx: Context) {
  try {
    const results = await addMediaService(ctx);
    ctx.body = response.success("上传成功！", results);
  } catch (error: any) {
    console.error("addMediaController error:", error);
    // Provide more specific error messages based on the error type if needed
    ctx.body = response.error(`上传失败: ${error.message}`);
  }
}

export async function deleteMediaController(ctx: Context) {
  const { mediaId } = ctx.params;
  if (!mediaId) {
    ctx.body = response.error("参数错误：缺少 mediaId");
    return;
  }

  const numberMediaId = Number(mediaId);
  if (isNaN(numberMediaId)) {
    ctx.body = response.error("参数错误：mediaId 必须是数字");
    return;
  }

  try {
    const deletedMedia = await deleteMediaService(numberMediaId);
    ctx.body = response.success("删除成功！", deletedMedia);
  } catch (error: any) {
    console.error("deleteMediaController error:", error);
    ctx.body = response.error(`删除失败: ${error.message}`);
  }
}

export async function updateMediaController(ctx: Context) {
  const body = ctx.request.body as MediaRequest;
  const { mediaId } = ctx.params;
  const { remarkName } = body;

  if (!mediaId || !remarkName) {
    ctx.body = response.error("参数错误：缺少 mediaId 或 remarkName");
    return;
  }

  const numberMediaId = Number(mediaId);
  if (isNaN(numberMediaId)) {
    ctx.body = response.error("参数错误：mediaId 必须是数字");
    return;
  }

  try {
    const updatedMedia = await updateMediaService(numberMediaId, remarkName, ctx.request.origin);
    ctx.body = response.success("更新成功！", updatedMedia);
  } catch (error: any) {
    console.error("updateMediaController error:", error);
    ctx.body = response.error(`更新失败: ${error.message}`);
  }
}
