import { SysMediaCategory } from "@prisma/client";
import * as mediaCategoryModel from "@/cmf/models/mediaCategory";

// 定义树节点类型
type TreeNode = SysMediaCategory & {
  children?: SysMediaCategory[];
};

// 将扁平数据转换为树形结构
export function dataToTreeService(data: TreeNode[]): TreeNode[] {
  const map: { [key: number]: TreeNode } = {};
  const tree: TreeNode[] = [];

  data.forEach((node) => {
    map[node.categoryId] = { ...node };
  });

  data.forEach((node) => {
    if (node.parentId !== 0) {
      const parent = map[node.parentId];
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(map[node.categoryId]);
      }
    } else {
      tree.push(map[node.categoryId]);
    }
  });

  return tree;
}

// 获取媒体分类列表
export async function getMediaCategoryListService(current: number, pageSize: number, where?: any) {
  return await mediaCategoryModel.getMediaCategoryListModel(current, pageSize, where);
}

// 获取媒体分类数量
export async function getMediaCategoryCountService() {
  return await mediaCategoryModel.getMediaCategoryCountModel();
}

// 获取单个媒体分类
export async function getMediaCategoryByIdService(categoryId: number) {
  return await mediaCategoryModel.getMediaCategoryByIdModel(categoryId);
}

// 创建媒体分类
export async function createMediaCategoryService(data: {
  name: string;
  parentId?: number;
  status: number;
  createdAt: number;
  createdId: number;
  createdBy: string;
  updatedAt: number;
  updatedId: number;
  updatedBy: string;
}) {
  return await mediaCategoryModel.createMediaCategoryModel(data);
}

// 更新媒体分类
export async function updateMediaCategoryService(categoryId: number, data: {
  name?: string;
  parentId?: number;
  status?: number;
  updatedAt: number;
  updatedId: number;
  updatedBy: string;
}) {
  return await mediaCategoryModel.updateMediaCategoryModel(categoryId, data);
}

// 删除媒体分类
export async function deleteMediaCategoryService(categoryId: number) {
  return await mediaCategoryModel.deleteMediaCategoryModel(categoryId);
}
