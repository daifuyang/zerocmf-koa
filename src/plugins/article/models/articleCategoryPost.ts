import prisma from "@/lib/prisma";

// 根据文章id获取所有分类关系
export async function getCategoryPostsByArticleId(articleId: number) {
  const categoryPosts = await prisma.cmsArticleCategoryPost.findMany({
    where: {
      articleId
    },
    include: {
      articleCategory: true
    }
  });
  return categoryPosts;
}

// 建立分类映射关系
export async function createArticleCategoryPost(
  articleId: number,
  categoryIds: number[],
  tx = prisma
) {
  const categoryPosts = await tx.cmsArticleCategoryPost.createMany({
    data: categoryIds.map((articleCategoryId) => {
      return {
        articleId,
        articleCategoryId
      };
    })
  });

  return categoryPosts;
}

// 更新文章和分类的关系
export async function updateArticleCategoryPost(
  articleId: number,
  categoryIds: number[],
  tx = prisma
) {
  // 查询之前的分类关系
  const oldCategoryPosts = await tx.cmsArticleCategoryPost.findMany({
    where: {
      articleId
    }
  });

  const set1 = new Set(categoryIds);
  const set2 = new Set(oldCategoryPosts?.map((item) => item.articleCategoryId));

  // 找出需要删除的
  const deleteCategoryIds = Array.from(set2).filter((item) => !set1.has(item));

  // 找出需要新增的
  const createCategoryIds = Array.from(set1).filter((item) => !set2.has(item));

  return await prisma.$transaction(async (tx) => {
    await tx.cmsArticleCategoryPost.deleteMany({
      where: {
        articleId,
        articleCategoryId: {
          in: deleteCategoryIds
        }
      }
    });

    await tx.cmsArticleCategoryPost.createMany({
      data: createCategoryIds.map((articleCategoryId) => {
        return {
          articleId,
          articleCategoryId
        };
      })
    });
  });
}

// 删除文章和分类的关系
export async function deleteArticleCategoryPost(articleId: number, tx = prisma) {
  const categoryPost = await tx.cmsArticleCategoryPost.findFirst({
    where: {
      articleId
    }
  });

  if (categoryPost) {
    await tx.cmsArticleCategoryPost.deleteMany({
      where: {
        articleId
      }
    });
  }
}

// 根据categoryId获取文章数量
export async function getArticleCountByCategoryId(categoryId: number, tx = prisma) {
  const count = await tx.cmsArticleCategoryPost.count({
    where: {
      articleCategoryId: categoryId
    }
  });
  return count;
}
