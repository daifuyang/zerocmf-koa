import { now } from "@/lib/date";
import { createPost, getPostByCode } from "../models/post";

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
    },
    {
      postCode: "CTO",
      postName: "技术总监",
      sortOrder: 2,
      status: 1,
      remark: "主管公司技术工作"
    },
    {
      postCode: "COO",
      postName: "运营总监",
      sortOrder: 3,
      status: 1,
      remark: "主管公司运营工作"
    },
    {
      postCode: "CFO",
      postName: "财务总监",
      sortOrder: 4,
      status: 1,
      remark: "主管公司财务工作"
    },
    {
      postCode: "PM",
      postName: "产品经理",
      sortOrder: 5,
      status: 1,
      remark: "负责产品规划与设计"
    },
    {
      postCode: "SE",
      postName: "高级工程师",
      sortOrder: 6,
      status: 1,
      remark: "负责系统架构与核心代码开发"
    },
    {
      postCode: "UI",
      postName: "UI设计师",
      sortOrder: 7,
      status: 1,
      remark: "负责用户界面设计"
    },
    {
      postCode: "FE",
      postName: "前端工程师",
      sortOrder: 8,
      status: 1,
      remark: "负责前端页面开发"
    },
    {
      postCode: "BE",
      postName: "后端工程师",
      sortOrder: 9,
      status: 1,
      remark: "负责后端服务开发"
    },
    {
      postCode: "QA",
      postName: "测试工程师",
      sortOrder: 10,
      status: 1,
      remark: "负责软件测试"
    },
    {
      postCode: "OP",
      postName: "运维工程师",
      sortOrder: 11,
      status: 1,
      remark: "负责系统运维"
    },
    {
      postCode: "HR",
      postName: "人力资源",
      sortOrder: 12,
      status: 1,
      remark: "负责人事管理"
    }
  ];

  // 遍历岗位数据并创建
  for (const post of posts) {
    // 检查岗位是否已存在
    const existingPost = await getPostByCode(post.postCode);
    
    // 如果不存在，则创建岗位
    if (!existingPost) {
      await createPost({
        ...post,
        createdBy: "admin",
        createdAt: now(),
        updatedBy: "admin",
        updatedAt: now()
      });
    }
  }
  
  console.log("初始化岗位数据成功");
}