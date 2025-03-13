import { Context } from "koa";
import { UAParser } from "ua-parser-js";

/**
 * 获取客户端IP地址
 * @param ctx Koa上下文
 * @returns IP地址
 */
export const getClientIP = (ctx: Context): string => {
  const headers = ctx.headers;
  const xForwardedFor = headers["x-forwarded-for"] as string;
  
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }
  
  return ctx.ip || "";
};

/**
 * 根据IP地址获取地理位置
 * @param ip IP地址
 * @returns 地理位置信息
 */
export const getLocationByIP = (ip: string): string => {
  // 这里可以接入第三方IP地址库进行查询
  // 简单实现，仅返回内网或外网标识
  if (ip === "::1" || ip === "127.0.0.1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return "内网IP";
  }
  return "未知位置";
};

/**
 * 解析用户代理信息
 * @param userAgent 用户代理字符串
 * @returns 浏览器和操作系统信息
 */
export const parseUserAgent = (userAgent: string) => {
  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  
  return {
    browser: `${browser.name || ""} ${browser.version || ""}`.trim(),
    os: `${os.name || ""} ${os.version || ""}`.trim()
  };
};

/**
 * 获取客户端完整信息
 * @param ctx Koa上下文
 * @returns 客户端信息
 */
export const getClientInfo = (ctx: Context) => {
  const ip = getClientIP(ctx);
  const location = getLocationByIP(ip);
  const userAgent = ctx.headers["user-agent"] || "";
  const { browser, os } = parseUserAgent(userAgent);
  
  return {
    ip,
    location,
    browser,
    os
  };
};
