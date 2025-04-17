import { Prisma } from "@prisma/client";
import { Context } from "koa";
import { MediaRequest, MediaFiles } from "@/cmf/typings/controller";
import {
  deleteMediaModel,
  getMediaCountModel,
  getMediaListModel,
  saveMediaListModel,
  updateMediaModel,
  getMediaByIdModel
} from "@/cmf/models/media";
import { parseQuery } from "@/lib/request";
import fs from "fs";
import { calculateHashes, getPrevPath, getUploadFolder, saveFile } from "@/lib/file";
import { PUBLIC_PATH } from "@/constants/path";
import path from "path";
import { getOptionValueModel } from "@/cmf/models/option"; // Updated import path and function name

const mediaEnums = [0, 1, 2, 3];

export const getMediaListService = async (ctx: Context) => {
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

  const total = await getMediaCountModel(where); // Updated function call
  const media = await getMediaListModel(current, pageSize, where);
  const pagination = {
    page: current,
    pageSize: pageSize,
    total,
    data: media.map((item) => ({
      ...item,
      prevPath: `${prevPath}${item.filePath}`
    }))
  };
  return pagination;
};

export const addMediaService = async (ctx: Context) => {
  const body = ctx.request.body as MediaRequest;
  const { type, categoryId } = body;
  const { origin = "" } = ctx.request;
  const mediaType = Number(type);

  if (isNaN(mediaType) || !mediaEnums.includes(mediaType)) {
    throw new Error("无效的媒体类型");
  }

  const categoryIdNumber = categoryId ? Number(categoryId) : undefined;
  const files = (ctx.request.files as MediaFiles)?.file;

  if (!files) {
    throw new Error("未找到上传文件");
  }

  const uploadFolder = path.resolve(PUBLIC_PATH, getUploadFolder());
  if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
  }

  const options = await getOptionValueModel("upload"); // Updated function call
  const fileTypes = {
    0: options.fileTypes.image,
    1: options.fileTypes.audio,
    2: options.fileTypes.video,
    3: options.fileTypes.file
  };

  const checkFileType = (file: any) => {
    const extension = file.originalFilename?.split(".").pop()?.toLowerCase();
    if (!extension || !fileTypes[mediaType]?.extensions?.includes(extension)) {
      throw new Error(`不支持的文件类型: ${extension}`);
    }
  };

  if (Array.isArray(files)) {
    files.forEach(checkFileType);
  } else {
    checkFileType(files);
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
        // Optionally remove the file if hashing fails
        // fs.unlinkSync(absPath);
        return null; // Indicate failure for this file
      }
    })
  );

  const validMediaResults = mediaResults.filter(item => item !== null) as Prisma.SysMediaCreateInput[];

  if (validMediaResults.length === 0) {
      throw new Error("所有文件处理失败");
  }

  const saveResult = await saveMediaListModel(validMediaResults); // Updated function call
  if (!saveResult || saveResult.count !== validMediaResults.length) {
    // Handle potential partial save failure (e.g., log, attempt cleanup)
    throw new Error("保存媒体信息失败");
  }

  return validMediaResults.map((item) => ({
    ...item,
    prevPath: `${origin}${item.filePath}`
  }));
};

export const deleteMediaService = async (mediaId: number) => {
  const media = await deleteMediaModel(mediaId);
  if (!media) {
    throw new Error("媒体资源不存在或已被删除");
  }
  // Optionally: Delete the actual file from storage
  // const filePath = path.join(PUBLIC_PATH, media.filePath);
  // if (fs.existsSync(filePath)) {
  //   fs.unlinkSync(filePath);
  // }
  return media;
};

export const updateMediaService = async (mediaId: number, remarkName: string, origin: string) => {
  const media = await getMediaByIdModel(mediaId); // Updated function call
  if (!media) {
    throw new Error("媒体资源不存在！");
  }

  const updatedMedia = await updateMediaModel(mediaId, { remarkName });
  return {
    ...updatedMedia,
    prevPath: `${origin}${media.filePath}`
  };
};
