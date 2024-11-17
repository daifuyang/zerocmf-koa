import Router from "koa-router";
import swaggerJSDoc from "swagger-jsdoc";

const router = new Router();
const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "NextCMS API Documentation",
      version: "1.0.0",
      description: "API documentation for NextCMS project"
    },
    components: {
      schemas: {
        Response: {
          type: "object",
          required: ["code", "msg"],
          properties: {
            code: {
              type: "integer",
              description: "Response code",
              example: 1
            },
            msg: {
              type: "string",
              description: "Response message"
            },
            data: {
              oneOf: [
                {
                  type: "object",
                  description: "Response data",
                  additionalProperties: true
                },
                {
                  type: "array",
                  items: {
                    type: "object"
                  },
                  description: "Response data"
                },
                { type: "string" },
                { type: "number" },
                { type: "boolean" }
              ]
            }
          }
        },
        UnAuthorized: {
          type: "object",
          required: ["msg"],
          properties: {
            msg: {
              type: "string",
              description: "Response message",
              example: "用户身份已过期"
            }
          }
        },
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT" // 可选
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT" // 可选
        }
      },
    },
    security: [
      {
        bearerAuth: [] // 全局应用
      }
    ],
    tags: [
      {
        name: "users",
        description: "用户相关"
      },
      {
        name: "admins",
        description: "管理员管理"
      },
      {
        name: "roles",
        description: "角色管理"
      }
    ],

    servers: [
      {
        url: "/",
        description: "Local server"
      }
    ]
  },
  apis: ["**/*.yaml"] // 这里指定包含Swagger注释的文件路径
};

const swaggerSpec = swaggerJSDoc(options);

router.get("/swagger.json", (ctx) => {
  ctx.body = swaggerSpec;
});

export default router;
