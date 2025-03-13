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
