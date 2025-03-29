import Router from "koa-router";
import {
  getCategoryListController,
  getCategoryController,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController
} from "../controller/category";
import {
  createArticleController,
  deleteArticleController,
  getArticleController,
  getArticleListController,
  updateArticleController
} from "../controller/article";
import { getTagListController, deleteTagController } from "../controller/tag";
import { adminPrefix } from "@/cmf/constants/router";
import { auth } from "@/cmf/middlewares/auth";
import apiAccess from "@/cmf/middlewares/apiAccess";
import { apiv1 } from "@/constants/router";
export default function initRouter() {
  const adminRouter = new Router({ prefix: apiv1 + adminPrefix });
  adminRouter.use(auth, apiAccess);
  adminRouter.get("/article-categories", getCategoryListController);
  adminRouter.get("/article-categories/:articleCategoryId", getCategoryController);
  adminRouter.post("/article-categories", createCategoryController);
  adminRouter.put("/article-categories/:articleCategoryId", updateCategoryController);
  adminRouter.delete("/article-categories/:articleCategoryId", deleteCategoryController);
  // 文章相关
  adminRouter.get("/articles", getArticleListController);
  adminRouter.get("/articles/:articleId", getArticleController);
  adminRouter.post("/articles", createArticleController);
  adminRouter.put("/articles/:articleId", updateArticleController);
  adminRouter.delete("/articles/:articleId", deleteArticleController);
  // 标签相关
  adminRouter.get("/article-tags", getTagListController);
  adminRouter.delete("/article-tags/:tagId", deleteTagController);
  return adminRouter;
}
