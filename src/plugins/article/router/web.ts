import Router from "koa-router";

import { getCategoryListController } from "../controller/category";

import { getArticleController, getArticleListController } from "../controller/article";
import { apiv1 } from "@/constants/router";
export default function initRouter() {
  const router = new Router({ prefix: apiv1 });
  router.get("/article-categories", getCategoryListController);
  router.get("/articles", getArticleListController);
  router.get("/articles/:articleId", getArticleController);
  return router;
}
