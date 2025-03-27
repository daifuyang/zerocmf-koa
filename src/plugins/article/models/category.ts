import redis from "@/lib/redis";
import { serializeData } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { CmsArticleCategory, Prisma } from "@prisma/client";

type TreeNode = CmsArticleCategory & {
  children?: CmsArticleCategory[];
};

const categoryIdKey = "articleCategory:articleCategoryId:";

// 获取分类总数
export async function getArticleCategoryCount(
  where: Prisma.CmsArticleCategoryWhereInput = {},
  tx = prisma
) {
  // 先获取所有的文章数量
  const total = tx.cmsArticleCategory.count({
    where: {
      deletedAt: 0,
      ...where
    }
  });
  return total;
}

// 获取分类列表
export async function getArticleCategoryList(
  page: number,
  pageSize: number,
  where: Prisma.CmsArticleCategoryWhereInput = {},
  tx = prisma
) {
  let args: {
    skip?: number;
    take?: number;
    where?: Prisma.CmsArticleCategoryWhereInput;
  } = {};

  if (pageSize !== 0) {
    args = {
      skip: (page - 1) * pageSize,
      take: pageSize
    };
  } else {
    args = {};
  }

  args.where = {
    deletedAt: 0,
    ...where
  };

  const categories = await tx.cmsArticleCategory.findMany({
    ...args
  });
  return categories;
}

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

// 获取分类树
export async function getArticleCategoryTree(
  where: Prisma.CmsArticleCategoryWhereInput = {},
  tx = prisma
) {
  const categories = await getArticleCategoryList(1, 0, where, tx);
  let treeData: any = [];
  if (categories) {
    treeData = dataToTree(categories);
  }
  return treeData;
}

// 根据id获取单个分类
export async function getArticleCategoryById(articleCategoryId: number, tx = prisma) {
  const key = `${categoryIdKey}${articleCategoryId}`;
  const cache = await redis.get(key);
  let category: CmsArticleCategory | null = null;
  if (cache) {
    category = JSON.parse(cache);
  } else {
    // 获取单个分类
    category = await tx.cmsArticleCategory.findUnique({
      where: {
        articleCategoryId,
        deletedAt: 0
      }
    });
    if (category) {
      redis.set(key, serializeData(category));
    }
  }
  return category;
}

// 根据条件获取分类
export async function getArticleCategory(
  where: Prisma.CmsArticleCategoryWhereInput = {},
  tx = prisma
) {
  const category = await tx.cmsArticleCategory.findFirst({
    where: {
      deletedAt: 0,
      ...where
    }
  });
  return category;
}

// 创建分类
export async function createArticleCategory(
  data: Prisma.CmsArticleCategoryCreateInput,
  tx = prisma
) {
  const category = await tx.cmsArticleCategory.create({
    data
  });
  return category;
}

// 更新分类
export async function updateArticleCategory(
  articleCategoryId: number,
  data: Prisma.CmsArticleCategoryUpdateInput,
  tx = prisma
) {
  const category = await tx.cmsArticleCategory.update({
    where: {
      articleCategoryId
    },
    data
  });

  if (category) {
    const key = `${categoryIdKey}${articleCategoryId}`;
    redis.del(key);
  }
  return category;
}

// 根据分类关系获取分类详细信息
export async function getCategorysByPosts(target: any, categoryPosts: any[]) {
  if (!target.category) {
    target.category = [];
  }

  for (let index = 0; index < categoryPosts.length; index++) {
    const post = categoryPosts[index];
    const { categoryId } = post;
    const category = await getArticleCategoryById(categoryId);
    target.category.push(category);
  }
}