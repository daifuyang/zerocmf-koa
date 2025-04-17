import { now } from "@/lib/date";
import { createPostModel, getPostByCodeModel } from "../models/post";

// 岗位数据迁移
export default async function migratePost() {
  // 定义常见的岗位数据
  const posts = [
    {
      postCode: "CEO",
      postName: "董事长",
      sortOrder: 1,
      status: 1,
      remark: "公司最高领导职务"
    }
  ];

  // 遍历岗位数据并创建
  for (const post of posts) {
    // 检查岗位是否已存在
    const existingPost = await getPostByCodeModel(post.postCode);
    
    // 如果不存在，则创建岗位
    if (!existingPost) {
      await createPostModel({
        ...post,
        createdBy: "admin",
        createdAt: now(),
        updatedBy: "admin",
        updatedAt: now()
      });
    }
  }
}
