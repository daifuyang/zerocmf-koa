import { getOptionValueModel, setOptionValueModel } from "../models/option";

export default async function migrateOption() { 
    const key = "upload";
     const option = await getOptionValueModel(key);
     if (!option) {
        const inValue = {
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
        await setOptionValueModel(key, JSON.stringify(inValue));
     }
}
