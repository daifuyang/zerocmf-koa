# 项目简介

## 使用示例

### 控制器

```tsx
import response from '@/lib/response'; // 引入响应处理库

// 获取接口列表
export const getApisController = async (ctx: Context) => {
  const apis = await getApis();

  if (!apis) {
    return response.error("获取失败！");
  }

  ctx.body = response.success("获取成功！", apis);
};

```

提示词示例：
在医美crm应用插件下完成派单管理功能。包含以下功能：
1.派单列表：显示派单医院，客户名称，客户性别，客户年龄，整形项目，派单时间，派单客服，当前状态
2.新建派单：指定派单医院，留言。
请帮我完成model层代码，可参考别的model的代码规范

请帮我完成swagger配置代码，前缀路由为/api/v1/admin
