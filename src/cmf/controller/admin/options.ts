import { getOptionValue, setOptionValue } from "@/cmf/models/option";
import response from "@/lib/response";
import { Context } from "koa";

const VALID_FILE_TYPES = ["image", "video", "audio", "file"];
const VALID_FILE_TYPE_KEYS = ["uploadMaxFileSize", "extensions"];

interface FileTypeConfig {
  uploadMaxFileSize: number;
  extensions: string[];
}

interface FileTypes {
  image: FileTypeConfig;
  video: FileTypeConfig;
  audio: FileTypeConfig;
  file: FileTypeConfig;
}

interface Value {
  maxFiles: number;
  chunkSize: number;
  fileTypes?: Partial<FileTypes>; // Partial 表示 fileTypes 的字段是可选的
}
export async function getOptionController(ctx: Context) {
  const { name } = ctx.params || {};
  if (!name) {
    ctx.body = response.error("参数错误！");
    return;
  }

  const option = await getOptionValue(name as string);
  if (option.optionValue) {
    option.optionValue = JSON.parse(option.optionValue);
  }
  ctx.body = response.success("获取成功！", option);
  return;
}

function filterFileTypes(fileTypes: any): any {
  const filteredFileTypes: any = {};

  // 遍历合法的 fileTypes
  for (const type of VALID_FILE_TYPES) {
    if (fileTypes[type] && typeof fileTypes[type] === "object") {
      filteredFileTypes[type] = {};

      // 遍历合法的键
      for (const key of VALID_FILE_TYPE_KEYS) {
        if (fileTypes[type][key] !== undefined) {
          let value = fileTypes[type][key];
          if( key === "uploadMaxFileSize") {
            value = Number(value);
          }
          filteredFileTypes[type][key] = value;
        }
      }
    }
  }

  return filteredFileTypes;
}

export async function setOptionController(ctx: Context) {
  const { name } = ctx.params || {};
  const value = ctx.request.body || {};
  if (!name || !value) {
    ctx.body = response.error("参数错误！");
    return;
  }

  const inValue: Value = {
    maxFiles: 20,
    chunkSize: 512,
    fileTypes: {
      image: {
        uploadMaxFileSize: 10240,
        extensions: ["jpg", "jpeg", "png", "gif", "bmp4"]
      },
      video: {
        uploadMaxFileSize: 10240,
        extensions: ["mp4", "avi", "wmv", "rm", "rmvb", "mkv"]
      },
      audio: {
        uploadMaxFileSize: 10240,
        extensions: ["mp3", "wma", "wav"]
      },
      file: {
        uploadMaxFileSize: 10240,
        extensions: ["txt", "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "zip", "rar"]
      }
    }
  };

  if (value.maxFiles != undefined) {
    inValue.maxFiles = value.maxFiles;
  }
  if (value.chunkSize != undefined) {
    inValue.chunkSize = value.chunkSize;
  }

  if (value.fileTypes != undefined) {
    inValue.fileTypes = filterFileTypes(value.fileTypes);
  }
  const inValueStr = JSON.stringify(inValue);
  await setOptionValue(name, inValueStr);
  ctx.body = response.success("设置成功！", inValue);
  return;
}
