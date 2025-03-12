import { SWAGGER_APIS } from "@/constants/path";
import Router from "koa-router";
import swaggerJSDoc from "swagger-jsdoc";

const router = new Router();
const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "ZeroCMF API Documentation",
      version: "1.0.0",
      description: "API documentation for ZeroCMF project"
    },
  },
  apis: [SWAGGER_APIS] // 这里指定包含Swagger注释的文件路径
};

const swaggerSpec = swaggerJSDoc(options);

router.get("/swagger.json", (ctx) => {
  ctx.body = swaggerSpec;
});

export default router;
