import { Context } from 'koa';
import * as postModel from '@/cmf/models/post';
import { PostRequest } from '@/cmf/typings/controller';
import { now } from '@/lib/date';
import response from '@/lib/response';
import dayjs from 'dayjs';

// 获取岗位列表
export const getPostListController = async (ctx: Context) => {
  try {
    const { current = "1", pageSize = "10", postCode, postName, startTime, endTime, status } = ctx.query;
    
    const where: any = {};
    
    if (postCode) {
      where.postCode = {
        contains: postCode as string
      };
    }
    
    if (postName) {
      where.postName = {
        contains: postName as string
      };
    }
    
    if (startTime || endTime) {
      where.createdAt = {};
      if (startTime) {
        where.createdAt.gte = dayjs(startTime as string).unix();
      }
      if (endTime) {
        where.createdAt.lte = dayjs(endTime as string).unix();
      }
    }

    if (status) {
      where.status = Number(status);
    }
    
    const posts = await postModel.getPostListModel(where, Number(current), Number(pageSize));
    
    let pagination = {};
    if (pageSize === "0") {
      pagination = posts;
    } else {
      const total = await postModel.getPostCountModel(where);
      pagination = {
        page: Number(current),
        pageSize: Number(pageSize),
        total,
        data: posts
      };
    }
    
    return ctx.body = response.success('获取成功', pagination);
  } catch (err: any) {
    return ctx.body = response.error(err.message);
  }
};

// 获取岗位详情
export const getPostController = async (ctx: Context) => {
  try {
    const { postId } = ctx.params;
    if (!postId) {
      return ctx.body = response.error('岗位ID不能为空');
    }
    
    const post = await postModel.getPostByIdModel(Number(postId));
    if (!post) {
      return ctx.body = response.error('岗位不存在');
    }
    
    return ctx.body = response.success('获取成功', post);
  } catch (err: any) {
    return ctx.body = response.error(err.message);
  }
};

// 添加岗位
export const createPostController = async (ctx: Context) => {
  try {
    const { postCode, postName, sortOrder = 1, status = 1, remark = '' } = ctx.request.body as PostRequest;
    
    if (!postCode) {
      return ctx.body = response.error('岗位编码不能为空');
    }
    
    if (!postName) {
      return ctx.body = response.error('岗位名称不能为空');
    }
    
    // 检查岗位编码是否唯一
    const isCodeUnique = await postModel.checkPostCodeUniqueModel(postCode);
    if (!isCodeUnique) {
      return ctx.body = response.error('岗位编码已存在');
    }
    
    // 检查岗位名称是否唯一
    const isNameUnique = await postModel.checkPostNameUniqueModel(postName);
    if (!isNameUnique) {
      return ctx.body = response.error('岗位名称已存在');
    }
    
    // 获取当前登录用户信息
    const { userId, username } = ctx.state.user || {};
    
    const data = {
      postCode,
      postName,
      sortOrder: Number(sortOrder),
      status: Number(status),
      remark,
      createdId: userId,
      createdBy: username || '',
      createdAt: now(),
      updatedAt: now()
    };
    
    const post = await postModel.createPostModel(data);
    return ctx.body = response.success('添加成功', post);
  } catch (err: any) {
    return ctx.body = response.error(err.message);
  }
};

// 更新岗位
export const updatePostController = async (ctx: Context) => {
  try {
    const { postId } = ctx.params;
    if (!postId) {
      return ctx.body = response.error('岗位ID不能为空');
    }
    
    const { postCode, postName, sortOrder, status, remark } = ctx.request.body as PostRequest;
    
    if (postCode) {
      // 检查岗位编码是否唯一
      const isCodeUnique = await postModel.checkPostCodeUniqueModel(postCode, Number(postId));
      if (!isCodeUnique) {
        return ctx.body = response.error('岗位编码已存在');
      }
    }
    
    if (postName) {
      // 检查岗位名称是否唯一
      const isNameUnique = await postModel.checkPostNameUniqueModel(postName, Number(postId));
      if (!isNameUnique) {
        return ctx.body = response.error('岗位名称已存在');
      }
    }
    
    // 获取当前登录用户信息
    const { userId, username } = ctx.state.user || {};
    
    const data: any = {
      updatedId: userId,
      updatedBy: username || '',
      updatedAt: now()
    };
    
    if (postCode !== undefined) data.postCode = postCode;
    if (postName !== undefined) data.postName = postName;
    if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);
    if (status !== undefined) data.status = Number(status);
    if (remark !== undefined) data.remark = remark;
    
    const post = await postModel.updatePostModel(Number(postId), data);
    return ctx.body = response.success('更新成功', post);
  } catch (err: any) {
    return ctx.body = response.error(err.message);
  }
};

// 删除岗位
export const deletePostController = async (ctx: Context) => {
  try {
    const { postId } = ctx.params;
    if (!postId) {
      return ctx.body = response.error('岗位ID不能为空');
    }
    
    await postModel.deletePostModel(Number(postId));
    return ctx.body = response.success('删除成功');
  } catch (err: any) {
    return ctx.body = response.error(err.message);
  }
};
