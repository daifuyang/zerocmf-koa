import { Context } from "koa";
import {
  createArticleCategory,
  getArticleCategory,
  getArticleCategoryById,
  getArticleCategoryCount,
  getArticleCategoryList,
  updateArticleCategory
} from "../models/category";
import response from "@/lib/response";
import { parseJson, parseQuery } from "@/lib/request";
import { cmsArticleCategory } from "@prisma/client";
import { now } from "@/lib/date";

type TreeNode = cmsArticleCategory & {
  children?: cmsArticleCategory[];
};
function dataToTree(data: TreeNode[]): TreeNode[] {
  const map: { [key: number]: TreeNode } = {};
  const tree: TreeNode[] = [];

  data.forEach((node) => {
    map[node.articleCategoryId] = { ...node };
  });

  data.forEach((node) => {
    if (node.parentId !== 0) {
      const parent = map[node.parentId];
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(map[node.articleCategoryId]);
      }
    } else {
      tree.push(map[node.articleCategoryId]);
    }
  });

  return tree;
}

// 获取分类
export async function getCategoryListController(ctx: Context) {
  const query = ctx.query || {};
  const { current, pageSize, isTree, name }: any = parseQuery(query);

  if (isTree) {
    const categories = await getArticleCategoryList(1, 0, { name: { contains: name } });
    ctx.body = response.success("获取成功！", dataToTree(categories));
    return;
  }
  // 获取所有文章，分页
  const categories = await getArticleCategoryList(current, pageSize, { name: { contains: name } });
  let pagination = {};
  if (pageSize === 0) {
    pagination = categories;
  } else {
    const total = await getArticleCategoryCount();
    pagination = {
      page: Number(current),
      pageSize: Number(pageSize),
      total,
      data: categories
    };
  }
  ctx.body = response.success("获取成功！", pagination);
  return;
}

// 查看分类
export async function getCategoryController(ctx: Context) {
  const { articleCategoryId } = ctx.params;

  if (!articleCategoryId) {
    ctx.body = response.error("缺少参数！");
    return;
  }

  const id = Number(articleCategoryId);

  if (isNaN(id)) {
    ctx.body = response.error("参数错误！");
    return;
  }

  const category = await getArticleCategoryById(id);

  if (!category) {
    ctx.body = response.error("分类不存在！");
    return;
  }

  ctx.body = response.success("获取成功！", category);
}

export async function saveCategory(ctx: Context, articleCategoryId: number | null) {
  const { userId, loginName } = ctx.state.user;

  const edit = articleCategoryId !== null;
  const {
    parentId = 0,
    name,
    description,
    icon,
    order,
    status
  } = parseJson(ctx) as cmsArticleCategory;

  if (!name) {
    ctx.body = response.error("分类名称不能为空！");
    return;
  }

  let checkName = true;
  if (edit) {
    const editCategory = await getArticleCategoryById(articleCategoryId);
    if (name === editCategory.name) {
      checkName = false; // 编辑时，如果名称没有变化，则不需要判断名称是否存在
    }
  }

  const parentIdNumber = Number(parentId);
  if (isNaN(parentIdNumber)) {
    ctx.body = response.error("参数错误！");
    return;
  }

  // 判断分类名称是否存在，不允许添加重复值
  if (checkName) {
    const exist = await getArticleCategory({
      name
    });

    if (exist) {
      ctx.body = response.error("分类名称已存在！");
      return;
    }
  }

  const path = parentId ? `0-${parentId}` : "0";
  const articleCount = 0;

  // 不存在则新增分类
  let category = null;
  let msg = "";
  if (edit) {
    category = await updateArticleCategory(articleCategoryId, {
      parentId,
      name,
      description,
      icon,
      order,
      articleCount,
      path,
      status,
      createId: userId,
      creator: loginName,
      updateId: userId,
      updater: loginName
    });
    msg = "更新成功！";
  } else {
    category = await createArticleCategory({
      parentId,
      name,
      description,
      icon,
      order,
      articleCount,
      path,
      status,
      createId: userId,
      creator: loginName,
      updateId: userId,
      updater: loginName,
      createdAt: now(),
      updatedAt: now()
    });
    msg = "创建成功！";
  }
  ctx.body = response.success(msg, category);
  return;
}

// 创建分类
export async function createCategoryController(ctx: Context) {
  await saveCategory(ctx, null);
}

// 修改分类
export async function updateCategoryController(ctx: Context) {
  const { articleCategoryId } = ctx.params;
  if (!articleCategoryId) {
    ctx.body = response.error("缺少参数！");
    return;
  }
  const id = Number(articleCategoryId);
  if (isNaN(id)) {
    ctx.body = response.error("参数错误！");
    return;
  }
  await saveCategory(ctx, id);
}

// 删除分类
export async function deleteCategoryController(ctx: Context) {
  const { articleCategoryId } = ctx.params;
  const articleCategoryIdNumber = Number(articleCategoryId);
  const category = await getArticleCategoryById(articleCategoryIdNumber);

  if (!category) {
    ctx.body = response.error("分类不存在！");
    return;
  }
  // 查询是否存在子集分类
  const children = await getArticleCategory({
    parentId: category.articleCategoryId
  });
  if (children) {
    ctx.body = response.error("存在子分类，清先删除子分类！");
    return;
  }
  const del = await updateArticleCategory(articleCategoryIdNumber, {
    deletedAt: now()
  });

  ctx.body = response.success("删除成功！", del);
  return;
}
