import { koaSwagger } from "koa2-swagger-ui";
import { SWAGGER_APIS } from "@/constants/path";
import Router from "koa-router";
import swaggerJSDoc from "swagger-jsdoc";

export const swaggerRouter = (() => {
  const router = new Router();
  const options = {
    swaggerDefinition: {
      openapi: "3.0.0",
      info: {
        title: "ZeroCMF API Documentation",
        version: "1.0.0",
        description: "API documentation for ZeroCMF project"
      }
    },
    apis: [SWAGGER_APIS]
  };

  const swaggerSpec = swaggerJSDoc(options);
  const prefix = "/api";

  const v1 = new Router({ prefix });
  v1.get("/swagger.json", (ctx) => {
    ctx.body = swaggerSpec;
  });

  v1.get(
    "/swagger",
    koaSwagger({
      routePrefix: false,
      swaggerOptions: {
        url: prefix + "/swagger.json",
      }
    })
  );
  
  router.use(v1.routes());
  return router;
})();
