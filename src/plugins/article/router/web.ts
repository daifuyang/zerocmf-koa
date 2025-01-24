import Router from "koa-router";

import {
    getCategoryListController
  } from "../controller/category";

  import {
    getArticleController,
    getArticleListController,
  } from "../controller/article";
export default function initRouter(router: Router) {
    router.get("/article-categories", getCategoryListController);
    router.get("/articles", getArticleListController);
    router.get("/articles/:articleId", getArticleController);
}