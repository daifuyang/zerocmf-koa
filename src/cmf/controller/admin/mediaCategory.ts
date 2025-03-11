import { Context } from "koa";
import response from "@/lib/response";
import {
  getMediaCategoryCount,
  getMediaCategoryList,
  createMediaCategory,
  updateMediaCategory,
  deleteMediaCategory,
  getMediaCategoryById
} from "@/cmf/models/mediaCategory";
import { parseQuery } from "@/lib/request";
import { now } from "@/lib/date";
import { sysMediaCategory } from "@prisma/client";

// 定义树节点类型
type TreeNode = sysMediaCategory & {
  children?: sysMediaCategory[];
};

// 将扁平数据转换为树形结构
function dataToTree(data: TreeNode[]): TreeNode[] {
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
export async function getMediaCategoryListController(ctx: Context) {
  const query = ctx.query || {};
  const { current, pageSize } = parseQuery(query);

  const mediaCategories = await getMediaCategoryList(current, pageSize);
  if (pageSize === 0) {
    ctx.body = response.success("获取成功！", mediaCategories);
    return;
  }

  const total = await getMediaCategoryCount();
  const pagination = {
    page: current,
    pageSize: pageSize,
    total,
    data: mediaCategories
  };
  ctx.body = response.success("获取成功！", pagination);
}

// 获取媒体分类树形结构
export async function getMediaCategoryTreeController(ctx: Context) {
  const query = ctx.query || {};
  const { parentId, name } = parseQuery(query);
  
  // 构建查询条件
  const where: any = {};
  if (name) {
    where.name = { contains: name };
  }
  
  // 获取所有媒体分类
  const mediaCategories = await getMediaCategoryList(1, 0, where);
  
  // 转换为树形结构并返回
  ctx.body = response.success("获取成功！", dataToTree(mediaCategories));
}

// 获取单个媒体分类
export async function getMediaCategoryController(ctx: Context) {
  const { categoryId } = ctx.params;

  if (!categoryId || isNaN(Number(categoryId))) {
    ctx.body = response.error("参数错误！");
    return;
  }

  const mediaCategory = await getMediaCategoryById(Number(categoryId));

  if (!mediaCategory) {
    ctx.body = response.error("媒体分类不存在！");
    return;
  }

  ctx.body = response.success("获取成功！", mediaCategory);
  return;
}

// 添加媒体分类
export async function addMediaCategoryController(ctx: Context) {
  await saveMediaCategory(ctx);
}

// 更新媒体分类
export async function updateMediaCategoryController(ctx: Context) {
  const { categoryId } = ctx.params;

  if (!categoryId || isNaN(Number(categoryId))) {
    ctx.body = response.error("参数错误！");
    return;
  }

  await saveMediaCategory(ctx, Number(categoryId));
}

// 保存媒体分类
async function saveMediaCategory(ctx: Context, categoryId: number | undefined = undefined) {
  const { userId, loginName } = ctx.state.user;
  const { name, parentId } = ctx.request.body;

  // 判断是新增还是更新
  if (!categoryId) {
    if (!name) {
      ctx.body = response.error("分类名称不能为空！");
      return;
    }

    const newCategory = await createMediaCategory({
      name,
      parentId,
      status: 1,
      createdAt: now(),
      createdId: userId,
      createdBy: loginName,
      updatedAt: now(),
      updatedId: userId,
      updatedBy: loginName
    });

    if (!newCategory) {
      ctx.body = response.error("添加失败！");
      return;
    }

    ctx.body = response.success("添加成功！", newCategory);
    return;
  } else {
    const updatedCategory = await updateMediaCategory(Number(categoryId), {
      name,
      parentId,
      status: 1,
      updatedAt: now(),
      updatedId: userId,
      updatedBy: loginName
    });

    if (!updatedCategory) {
      ctx.body = response.error("更新失败！");
      return;
    }
    ctx.body = response.success("更新成功！", updatedCategory);
    return;
  }
}

// 删除媒体分类
export async function deleteMediaCategoryController(ctx: Context) {
  const { categoryId } = ctx.params;

  if (!categoryId || isNaN(Number(categoryId))) {
    ctx.body = response.error("参数错误！");
    return;
  }

  const deletedCategory = await deleteMediaCategory(Number(categoryId));

  if (!deletedCategory) {
    ctx.body = response.error("删除失败！");
    return;
  }

  ctx.body = response.success("删除成功！", deletedCategory);
}
