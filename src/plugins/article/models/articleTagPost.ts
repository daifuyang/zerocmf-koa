// 根据tagId获取文章数量
export async function getTagPostCount(tagId: number, tx = prisma) {
  const count = tx.cmsArticleTagPost.count({
    where: {
      tagId
    }
  });
  return count;
}

// 根据文章id获取标签列表
export async function getTagListByArticleId(articleId: number, tx = prisma) {
  const tagPosts = await tx.cmsArticleTagPost.findMany({
    where: {
      articleId
    }
  });
  return tagPosts;
}

// 新增文章标签关联表
export async function createArticleTagPost(articleId: number, tagIds: number[], tx = prisma) {

  await tx.cmsArticleTagPost.deleteMany({
    where: {
      articleId
    }
  });

  const articleTagPosts = tagIds.map((tagId) => ({
    articleId,
    tagId
  }));
  return await tx.cmsArticleTagPost.createMany({
    data: articleTagPosts
  });
}
