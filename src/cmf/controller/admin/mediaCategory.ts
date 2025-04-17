import { Context } from "koa";
import response from "@/lib/response";
import { 
  getMediaCategoryListService,
  getMediaCategoryCountService,
  dataToTreeService,
  getMediaCategoryByIdService,
  createMediaCategoryService,
  updateMediaCategoryService,
  deleteMediaCategoryService
} from "@/cmf/services/mediaCategory"; // Corrected path and function names
import { parseQuery } from "@/lib/request";
import { now } from "@/lib/date";

interface MediaCategoryRequest {
  name: string;
  parentId?: number;
}

// 获取媒体分类列表
export async function getMediaCategoryListController(ctx: Context) {
  const query = ctx.query || {};
  const { current, pageSize } = parseQuery(query);

  const mediaCategories = await getMediaCategoryListService(current, pageSize);
  if (pageSize === 0) {
    ctx.body = response.success("获取成功！", mediaCategories);
    return;
  }

  const total = await getMediaCategoryCountService();
  const pagination = {
    page: current,
    pageSize: pageSize,
    total,
    data: mediaCategories
  };
  ctx.body = response.success("获取成功！", pagination);
}

// 获取媒体分类树形结构
export async function getMediaCategoryTreeController(ctx: Context) {
  const query = ctx.query || {};
  const { parentId, name } = parseQuery(query);
  
  // 构建查询条件
  const where: any = {};
  if (name) {
    where.name = { contains: name };
  }
  
  // 获取所有媒体分类
  const mediaCategories = await getMediaCategoryListService(1, 0, where);
  
  // 转换为树形结构并返回
  ctx.body = response.success("获取成功！", dataToTreeService(mediaCategories));
}

// 获取单个媒体分类
export async function getMediaCategoryController(ctx: Context) {
  const { categoryId } = ctx.params;

  if (!categoryId || isNaN(Number(categoryId))) {
    ctx.body = response.error("参数错误！");
    return;
  }

  const mediaCategory = await getMediaCategoryByIdService(Number(categoryId));

  if (!mediaCategory) {
    ctx.body = response.error("媒体分类不存在！");
    return;
  }

  ctx.body = response.success("获取成功！", mediaCategory);
  return;
}

// 添加媒体分类
export async function addMediaCategoryController(ctx: Context) {
  await saveMediaCategory(ctx);
}

// 更新媒体分类
export async function updateMediaCategoryController(ctx: Context) {
  const { categoryId } = ctx.params;

  if (!categoryId || isNaN(Number(categoryId))) {
    ctx.body = response.error("参数错误！");
    return;
  }

  await saveMediaCategory(ctx, Number(categoryId));
}

// 保存媒体分类
async function saveMediaCategory(ctx: Context, categoryId: number | undefined = undefined) {
  const { userId, loginName } = ctx.state.user;
  const { name, parentId } = ctx.request.body as MediaCategoryRequest;

  // 判断是新增还是更新
  if (!categoryId) {
    if (!name) {
      ctx.body = response.error("分类名称不能为空！");
      return;
    }

    const newCategory = await createMediaCategoryService({
      name,
      parentId,
      status: 1,
      createdAt: now(),
      createdId: userId,
      createdBy: loginName,
      updatedAt: now(),
      updatedId: userId,
      updatedBy: loginName
    });

    if (!newCategory) {
      ctx.body = response.error("添加失败！");
      return;
    }

    ctx.body = response.success("添加成功！", newCategory);
    return;
  } else {
    const updatedCategory = await updateMediaCategoryService(Number(categoryId), {
      name,
      parentId,
      status: 1,
      updatedAt: now(),
      updatedId: userId,
      updatedBy: loginName
    });

    if (!updatedCategory) {
      ctx.body = response.error("更新失败！");
      return;
    }
    ctx.body = response.success("更新成功！", updatedCategory);
    return;
  }
}

// 删除媒体分类
export async function deleteMediaCategoryController(ctx: Context) {
  const { categoryId } = ctx.params;

  if (!categoryId || isNaN(Number(categoryId))) {
    ctx.body = response.error("参数错误！");
    return;
  }

  const deletedCategory = await deleteMediaCategoryService(Number(categoryId));

  if (!deletedCategory) {
    ctx.body = response.error("删除失败！");
    return;
  }

  ctx.body = response.success("删除成功！", deletedCategory);
}
