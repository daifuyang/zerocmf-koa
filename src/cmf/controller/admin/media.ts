import {
  deleteMedia,
  getMediaCount,
  getMediaList,
  saveMediaList,
  updateMedia,
  getMediaById
} from "@/cmf/models/media";
import { parseQuery } from "@/lib/request";
import response from "@/lib/response";
import { Context } from "koa";
import fs from "fs";
import { calculateHashes, getPrevPath, getUploadFolder, saveFile } from "@/lib/file";
import { PUBLIC_PATH } from "@/constants/path";
import path from "path";
import { Prisma } from "@prisma/client";
import { getOptionValue } from "@/lib/option";
import { MediaRequest, MediaFiles } from "@/cmf/typings/controller";

export async function getMediaListController(ctx: Context) {
  const prevPath = getPrevPath(ctx);
  const query = ctx.query || {};
  const { current, pageSize, type, categoryId } = parseQuery(query);

  const where: Prisma.SysMediaWhereInput = {};
  const mediaType = Number(type);
  if (!isNaN(mediaType)) {
    where.mediaType = mediaType;
  }

  const categoryIdNumber = Number(categoryId);
  if (categoryId && !isNaN(categoryIdNumber) && categoryIdNumber > 0) {
    where.categoryId = categoryIdNumber;
  }

  const total = await getMediaCount(where);
  const media = await getMediaList(current, pageSize, where);
  const pagination = {
    page: current,
    pageSize: pageSize,
    total,
    data: media.map((item) => ({
      ...item,
      prevPath: `${prevPath}${item.filePath}`
    }))
  };
  ctx.body = response.success("获取成功！", pagination);
}

const mediaEnums = [0, 1, 2, 3];
export async function addMediaController(ctx: Context) {
  const body = ctx.request.body as MediaRequest;
  const { type, categoryId } = body;
  const { origin = "" } = ctx.request;
  const mediaType = Number(type);

  if (isNaN(mediaType) || !mediaEnums.includes(mediaType)) {
    ctx.body = response.error("上传失败！");
    return;
  }

  const categoryIdNumber = categoryId ? Number(categoryId) : undefined;
  const files = (ctx.request.files as MediaFiles)?.file;

  if (!files) {
    ctx.body = response.error("上传失败！");
    return;
  }

  const uploadFolder = path.resolve(PUBLIC_PATH, getUploadFolder());
  if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
  }

  const options = await getOptionValue("upload");
  const fileTypes = {
    0: options.fileTypes.image,
    1: options.fileTypes.audio,
    2: options.fileTypes.video,
    3: options.fileTypes.file
  };

  if (
    !Array.isArray(files) &&
    !fileTypes[mediaType]?.extensions?.includes(files.filepath.split(".").pop()?.toLowerCase())
  ) {
    ctx.body = response.error("上传失败！", {
      extensions: fileTypes[mediaType]?.extensions,
      filePath: files.filepath,
      extname: path.extname(files.filepath)
    });
    return;
  }

  const results = Array.isArray(files) ? files.map((file) => saveFile(file)) : [saveFile(files)];

  const mediaResults = await Promise.all(
    results.map(async (result) => {
      const { filePath, ...rest } = result;
      const absPath = PUBLIC_PATH + filePath;
      try {
        const hashed = await calculateHashes(absPath);
        return {
          ...rest,
          ...hashed,
          filePath,
          mediaType,
          categoryId: categoryIdNumber
        };
      } catch (error) {
        console.error("calculateHashes error", error);
        return null;
      }
    })
  );

  const saveMedia = await saveMediaList(mediaResults);
  if (!saveMedia) {
    ctx.body = response.error("上传失败！");
    return;
  }

  ctx.body = response.success(
    "上传成功！",
    mediaResults.map((item) => ({
      ...item,
      prevPath: `${origin}${item.filePath}`
    }))
  );
}

export async function deleteMediaController(ctx: Context) {
  const { mediaId } = ctx.params;
  if (!mediaId) {
    ctx.body = response.error("参数错误！");
    return;
  }

  const numberMediaId = Number(mediaId);
  if (isNaN(numberMediaId)) {
    ctx.body = response.error("参数错误！");
    return;
  }

  try {
    const media = await deleteMedia(numberMediaId);
    if (!media) {
      ctx.body = response.error("媒体资源不存在！");
      return;
    }
    ctx.body = response.success("删除成功！", media);
  } catch (error) {
    ctx.body = response.error("删除失败！");
  }
}

export async function updateMediaController(ctx: Context) {
  const body = ctx.request.body as MediaRequest;
  const { mediaId, remarkName } = {
    ...ctx.params,
    ...body
  };

  if (!mediaId || !remarkName) {
    ctx.body = response.error("参数错误！");
    return;
  }

  const numberMediaId = Number(mediaId);
  if (isNaN(numberMediaId)) {
    ctx.body = response.error("参数错误！");
    return;
  }

  try {
    const media = await getMediaById(numberMediaId);
    if (!media) {
      ctx.body = response.error("媒体资源不存在！");
      return;
    }

    const updatedMedia = await updateMedia(numberMediaId, { remarkName });
    ctx.body = response.success("更新成功！", {
      ...updatedMedia,
      prevPath: `${ctx.request.origin}${media.filePath}`
    });
  } catch (error) {
    console.error("updateMediaController error", error);
    ctx.body = response.error("更新失败！");
  }
}
