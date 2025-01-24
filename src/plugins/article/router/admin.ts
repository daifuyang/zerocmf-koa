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
export default function initRouter(adminRouter: Router) {
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
}
