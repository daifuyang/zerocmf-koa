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

// 获取媒体资源列表
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

// 添加媒体资源

const mediaEnums = [0, 1, 2, 3];
export async function addMediaController(ctx: Context) {
  const { type, categoryId } = ctx.request.body;

  const { origin = "" } = ctx.request;

  const mediaType = Number(type);
  if (isNaN(mediaType) || !mediaEnums.includes(mediaType)) {
    ctx.body = response.error("上传失败！");
    return;
  }

  const categoryIdNumber = categoryId ? Number(categoryId) : undefined;

  const files = ctx.request.files?.file;
  if (!files) {
    ctx.body = response.error("上传失败！");
    return;
  }

  // 获取当前日期的文件夹路径
  const uploadFolder = path.resolve(PUBLIC_PATH, getUploadFolder());
  // 如果文件夹不存在，则创建
  if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
  }

  // 获取上传配置
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

  // 处理单个文件或多个文件
  const results = Array.isArray(files)
    ? files.map((file) => saveFile(file)) // 处理多个文件
    : [saveFile(files)]; // 处理单个文件

  // 获取文件的md5和sha1值
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
        // todo
        return null;
      }
    })
  );
  // 入库
  const saveMedia = await saveMediaList(mediaResults);
  if (!saveMedia) {
    ctx.body = response.error("上传失败！");
    return;
  }

  ctx.body = response.success(
    "上传成功！",
    mediaResults.map((item) => {
      return {
        ...item,
        prevPath: `${origin}${item.filePath}`
      };
    })
  );
  return;
}

// 删除媒体资源
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

// 更新媒体文件名
export async function updateMediaController(ctx: Context) {
  const { mediaId } = ctx.params;
  const { remarkName } = ctx.request.body;

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
    // 获取原媒体信息
    const media = await getMediaById(numberMediaId);

    if (!media) {
      ctx.body = response.error("媒体资源不存在！");
      return;
    }

    // 更新数据库记录中的remarkName
    const updatedMedia = await updateMedia(numberMediaId, {
      remarkName
    });

    ctx.body = response.success("更新成功！", {
      ...updatedMedia,
      prevPath: `${ctx.request.origin}${media.filePath}`
    });
  } catch (error) {
    console.error("updateMediaController error", error);
    ctx.body = response.error("更新失败！");
  }
}
