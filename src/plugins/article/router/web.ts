import Router from "koa-router";

import {
    getCategoryListController
  } from "../controller/category";

  import {
    getArticleController,
    getArticleListController,
  } from "../controller/article";
export default function initRouter() {
    const router = new Router();
    router.get("/article-categories", getCategoryListController);
    router.get("/articles", getArticleListController);
    router.get("/articles/:articleId", getArticleController);
    return router;
}