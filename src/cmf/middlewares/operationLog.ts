import { Context, Next } from "koa";
import { getClientIP, getLocationByIP } from "@/lib/clientInfo";
import { createOperationLog, BusinessType, OperatorType } from "../models/operationLog";
import { getApiByMethodAndPath } from "../models/api";
import { getMenuApiByQuery } from "../models/menuApi";
import { getMenuById } from "../models/menu";
import { now } from "@/lib/date";

/**
 * 操作日志记录中间件配置接口
 */
export interface OperationLogOptions {
  title?: string; // 模块标题（可选，如果不提供将通过API关联的菜单获取）
  businessType?: BusinessType; // 业务类型（可选，如果不提供将通过HTTP方法推断）
  operatorType?: OperatorType; // 操作者类型
  isSaveRequestData?: boolean; // 是否保存请求的参数
  isSaveResponseData?: boolean; // 是否保存响应的参数
}

/**
 * 根据HTTP方法推断业务类型
 * @param method HTTP方法
 * @returns 业务类型
 */
const inferBusinessTypeFromMethod = (method: string): BusinessType => {
  switch (method.toUpperCase()) {
    case "POST":
      return BusinessType.INSERT;
    case "PUT":
    case "PATCH":
      return BusinessType.UPDATE;
    case "DELETE":
      return BusinessType.DELETE;
    case "GET":
    default:
      return BusinessType.OTHER;
  }
};

const getMenuPath = async (menuId: number): Promise<string> => {
  const menu = await getMenuById(menuId);
  if (menu && menu.parentId !== 0) {
    const parentPath = await getMenuPath(menu.parentId);
    return `${parentPath}/${menu.menuName}`;
  }
  return menu ? menu.menuName : "";
};

/**
 * 操作日志记录中间件
 * @param options 操作日志配置选项
 * @returns Koa中间件
 */
export const operationLog = async (ctx: Context, next: Next) => {
  // 获取请求信息
  const { method, url, path, request } = ctx;
  const ip = getClientIP(ctx);
  const location = getLocationByIP(ip);

  // 获取当前用户信息
  const user = ctx.state.user || {};
  const userId = user.userId;
  const operName = user.loginName || user.nickname || "未知用户";

  // 获取请求参数
  let requestData = "";
  if (method === "GET") {
    requestData = JSON.stringify(ctx.query);
  } else if (method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE") {
    requestData = JSON.stringify(request.body);
  }

  let status = 1; // 默认操作成功
  let errorMsg = ""; // 错误信息
  let jsonResult = ""; // 返回数据

  // 默认使用配置中的业务类型，如果没有则根据HTTP方法推断
  let businessType = inferBusinessTypeFromMethod(method);
  let title = path; // 默认使用配置中的标题
  let deptName = ""; // 部门名称

  try {
    // 尝试获取API和关联的菜单信息
    const apiPath = path;

    if (apiPath) {
      try {
        // 查找API记录
        const api = await getApiByMethodAndPath(method, apiPath);
        if (api) {
          // 查找API关联的菜单
          const menuApi = await getMenuApiByQuery({ apiId: api.id });

          if (menuApi) {
            // 获取菜单信息
            const menu = await getMenuById(menuApi.menuId);
            if (menu) {
              // 获取菜单的所有层级关系，递归找父级最终显示示例：系统管理/用户管理/用户列表
              title = await getMenuPath(menu.menuId);

              // 如果菜单类型是按钮，并且没有指定业务类型，可以尝试从权限标识推断
              if (menu.menuType === 2 && menu.perms) {
                // 根据权限标识中的关键词推断业务类型
                const perms = menu.perms.toLowerCase();
                if (perms.includes("add") || perms.includes("create")) {
                  businessType = BusinessType.INSERT;
                } else if (perms.includes("edit") || perms.includes("update")) {
                  businessType = BusinessType.UPDATE;
                } else if (perms.includes("delete") || perms.includes("remove")) {
                  businessType = BusinessType.DELETE;
                } else if (perms.includes("export")) {
                  businessType = BusinessType.EXPORT;
                } else if (perms.includes("import")) {
                  businessType = BusinessType.IMPORT;
                } else if (perms.includes("grant") || perms.includes("assign")) {
                  businessType = BusinessType.GRANT;
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("获取API和菜单信息失败:", err);
        // 错误不影响主流程，继续使用默认值
      }
    }

    // 执行下一个中间件
    await next();
  } catch (error: any) {
    status = 0; // 操作失败
    errorMsg = error.message || "操作执行异常";
    throw error; // 继续抛出异常，让上层中间件处理
  } finally {
    // 异步记录操作日志
    const operatorType = OperatorType.ADMIN;

    createOperationLog({
      title,
      businessType,
      method: ctx._matchedRoute || "", // 路由匹配的路径
      requestMethod: method,
      operatorType,
      operName,
      deptName,
      operUrl: url,
      operIp: ip,
      operLocation: location,
      operParam: requestData,
      jsonResult,
      status,
      errorMsg,
      operAt: now(),
      userId
    }).catch((err) => {
      console.error("记录操作日志失败:", err);
    });
  }
};
