import { parseJson, parseQuery } from "@/lib/request";
import { Context } from "koa";
import {
  createArticle,
  getArticleById,
  getArticleCount,
  getArticleList,
  updateArticle
} from "../models/article";
import response from "@/lib/response";
import { getArticleCategoryById, updateArticleCategory } from "../models/category";
import { formatField, formatFields, now } from "@/lib/date";
import { cmsArticle, PrismaClient } from "@prisma/client";
import {
  createArticleCategoryPost,
  deleteArticleCategoryPost,
  getArticleCountByCategoryId,
  getCategoryPostsByArticleId,
  updateArticleCategoryPost
} from "../models/articleCategoryPost";

import { compressHTML } from "@/lib/html";
import { createArticleTagPost } from "../models/articleTagPost";
import { createTagService } from "../service/tag";
import dayjs from "dayjs";
import prisma from "@/lib/prisma";

// 获取文章列表
export async function getArticleListController(ctx: Context) {
  const query = ctx.query || {};
  const { current, pageSize, title, categoryId } = parseQuery(query);

  // 检查 categoryId 是否为有效数字
  const categoryIdNumber = Number(categoryId);
  if (categoryId && isNaN(categoryIdNumber)) {
    ctx.body = response.error("参数错误！");
    return;
  }

  // 动态构建查询条件
  const where: any = {};

  // 如果 title 存在，添加到查询条件
  if (title) {
    where.title = { contains: title };
  }

  // 如果 categoryId 存在，添加到查询条件
  if (categoryId) {
    where.categories = { some: { articleCategoryId: categoryIdNumber } };
  }

  // 查询总数
  const total = await getArticleCount(where);

  // 查询文章列表
  const list = await getArticleList(current, pageSize, where);

  // 格式化字段
  formatFields(list, [
    { fromField: "createdAt", toField: "createdTime" },
    { fromField: "updatedAt", toField: "updatedTime" },
    { fromField: "publishedAt", toField: "publishedTime", format: "YYYY-MM-DD" },
  ]);

  // 处理文章数据
  const data = [];
  for (const item of list) {
    const articleId = item.articleId;
    const categoryPosts = await getCategoryPostsByArticleId(articleId);
    data.push({
      ...item,
      keywords: item.keywords?.split(",") || [],
      category: categoryPosts.map((post) => {
        return {
          categoryId: post.articleCategoryId,
          categoryName: post.articleCategory?.name,
        };
      }),
    });
  }

  // 返回结果
  ctx.body = response.success("获取成功！", { total, data, current, pageSize });
  return;
}

// 获取文章详情
export async function getArticleController(ctx: Context) {
  const { articleId } = ctx.params;
  const articleIdNumber = Number(articleId);
  if (isNaN(articleIdNumber)) {
    ctx.body = response.error("参数错误！");
    return;
  }
  const article = await getArticleById(articleIdNumber);

  if (!article) {
    ctx.body = response.error("文章不存在！");
    return;
  }

  formatField(article, [
    { fromField: "createdAt", toField: "createdTime" },
    { fromField: "updatedAt", toField: "updatedTime" },
    { fromField: "publishedAt", toField: "publishedTime" }
  ]);

  const categoryPosts = await getCategoryPostsByArticleId(article.articleId);

  const data: any = { ...article };

  data.keywords = article.keywords?.split(",") || [];
  data.category = categoryPosts.map((post) => {
    return {
      categoryId: post.articleCategoryId,
      categoryName: post.articleCategory?.name
    };
  });

  ctx.body = response.success("获取成功！", data);
  return;
}

// 保存文章
export async function saveArticle(ctx: Context, articleId: number | null) {
  const { userId, loginName } = ctx.state.user;

  const json = await parseJson(ctx);
  const { categoryIds, title, excerpt, publishedAt = dayjs().unix(), thumbnail, author = loginName } = json;
  let { content = "" } = json;

  content = compressHTML(content);

  let { keywords = "" } = json;
  const edit = articleId !== null;

  let keywordArr = keywords;

  if (keywords instanceof Array) {
    keywords = keywords?.join(",");
  }

  // 验证必填参数不能为空
  if (categoryIds?.length <= 0) {
    ctx.body = response.error("分类不能为空！");
    return;
  }

  if (!title) {
    ctx.body = response.error("文章标题不能为空！");
    return;
  }

  // 判断分类是否存在
  for (let index = 0; index < categoryIds.length; index++) {
    const cid = categoryIds[index];
    const category = await getArticleCategoryById(cid);
    if (!category) {
      ctx.body = response.error("分类不存在！");
      return;
    }
  }

  let msg = null;
  const result = await prisma.$transaction(async (tx: PrismaClient) => {
    let article: cmsArticle = null;
    if (edit) {
      article = await updateArticle(
        articleId,
        {
          title,
          content,
          keywords,
          excerpt,
          thumbnail,
          publishedAt,
          author,
          createId: userId,
          creator: loginName,
          updateId: userId,
          updater: loginName,
          createdAt: now(),
          updatedAt: now()
        },
        tx
      );
      if (article) {
        await updateArticleCategoryPost(articleId, categoryIds, tx);
      }
      msg = "更新成功！";
    } else {
      article = await createArticle(
        {
          title,
          content,
          keywords,
          excerpt,
          publishedAt,
          createId: userId,
          creator: loginName,
          updateId: userId,
          updater: loginName,
          createdAt: now(),
          updatedAt: now()
        },
        tx
      );
      if (article) {
        await createArticleCategoryPost(article.articleId, categoryIds, tx);
      }

      msg = "创建成功！";
    }

    for (const categoryId of categoryIds) {
      const count = await getArticleCountByCategoryId(categoryId, tx);
      await updateArticleCategory(
        categoryId,
        {
          articleCount: count
        },
        tx
      );
    }

    let tagIds = [];
    for (const keyword of keywordArr) {
      // 根据tag名称获取tagId
      const tag = await createTagService(keyword, tx);
      if (tag) {
        tagIds.push(tag.tagId);
      }
    }

    await createArticleTagPost(article.articleId, tagIds, tx);

    return article;
  });

  ctx.body = response.success(msg, result);
  return;
}

// 创建文章
export async function createArticleController(ctx: Context) {
  await saveArticle(ctx, null);
}

// 更新文章
export async function updateArticleController(ctx: Context) {
  const { articleId } = ctx.params;
  const articleIdNumber = Number(articleId);
  if (isNaN(articleIdNumber)) {
    ctx.body = response.error("参数错误！");
    return;
  }
  await saveArticle(ctx, articleIdNumber);
}

// 删除文章
export async function deleteArticleController(ctx: Context) {
  const { articleId } = ctx.params;
  const articleIdNumber = Number(articleId);
  if (isNaN(articleIdNumber)) {
    ctx.body = response.error("参数错误！");
    return;
  }

  const exist = await getArticleById(articleIdNumber);

  if (!exist) {
    ctx.body = response.error("文章不存在！");
    return;
  }

  const result = await prisma.$transaction(async (tx: PrismaClient) => {
    const article = await updateArticle(
      articleIdNumber,
      {
        deletedAt: now()
      },
      tx
    );
    if (article) {
      await deleteArticleCategoryPost(article.articleId, tx);
    }
    return article;
  });

  ctx.body = response.success("删除成功！", result);
  return;
}
