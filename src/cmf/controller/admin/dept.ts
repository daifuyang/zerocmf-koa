import { Context } from 'koa';
import * as deptModel from '@/cmf/models/dept';
import { now } from '@/lib/date';
import response from '@/lib/response';
import dayjs from 'dayjs';
import { DeptRequest, DeptWhere } from '@/cmf/typings/controller';

// 获取部门列表
export const getDeptListController = async (ctx: Context) => {
  try {
    const { deptName, leader, startTime, endTime, status } = ctx.query;
    
    const where: DeptWhere = {};
    
    if (deptName) {
      where.deptName = {
        contains: deptName as string
      };
    }
    
    if (leader) {
      where.leader = {
        contains: leader as string
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
    
    const depts = await deptModel.getDeptListModel(where);
    return ctx.body = response.success('获取成功', depts);
  } catch (err: any) {
    return ctx.body = response.error(err.message);
  }
};

// 获取部门树结构
export const getDeptTreeController = async (ctx: Context) => {
  try {
    const { deptName, leader, startTime, endTime, status } = ctx.query;
    
    const where: DeptWhere = {};
    
    if (deptName) {
      where.deptName = {
        contains: deptName as string
      };
    }
    
    if (leader) {
      where.leader = {
        contains: leader as string
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
    
    const deptTree = await deptModel.getDeptTreeModel(where);
    return ctx.body = response.success('获取成功', deptTree);
  } catch (err: any) {
    return ctx.body = response.error(err.message);
  }
};

// 获取部门详情
export const getDeptController = async (ctx: Context) => {
  try {
    const { deptId } = ctx.params;
    if (!deptId) {
      return ctx.body = response.error('部门ID不能为空');
    }
    
    const dept = await deptModel.getDeptByIdModel(Number(deptId));
    if (!dept) {
      return ctx.body = response.error('部门不存在');
    }
    
    return ctx.body = response.success('获取成功', dept);
  } catch (err: any) {
    return ctx.body = response.error(err.message);
  }
};

// 添加部门
export const createDeptController = async (ctx: Context) => {
  try {
    const body = ctx.request.body as DeptRequest;
    const { deptName, parentId = 0, sortOrder = 1, leader, phone, email, status = 1 } = body;
    
    if (!deptName) {
      return ctx.body = response.error('部门名称不能为空');
    }
    
    // 检查部门名称是否唯一
    const isUnique = await deptModel.checkDeptNameUniqueModel(deptName, Number(parentId));
    if (!isUnique) {
      return ctx.body = response.error('部门名称已存在');
    }
    
    // 获取当前登录用户信息
    const { userId, username } = ctx.state.user || {};
    
    const data = {
      deptName,
      parentId: Number(parentId),
      sortOrder: Number(sortOrder),
      leader,
      phone,
      email,
      status: Number(status),
      createdId: userId,
      createdBy: username || '',
      createdAt: now(),
      updatedAt: now()
    };
    
    const dept = await deptModel.createDeptModel(data);
    return ctx.body = response.success('添加成功', dept);
  } catch (err: any) {
    return ctx.body = response.error(err.message);
  }
};

// 更新部门
export const updateDeptController = async (ctx: Context) => {
  try {
    const { deptId } = ctx.params;
    if (!deptId) {
      return ctx.body = response.error('部门ID不能为空');
    }
    
    const body = ctx.request.body as DeptRequest;
    const { deptName, parentId, sortOrder, leader, phone, email, status } = body;
    
    if (deptName) {
      // 检查部门名称是否唯一
      const isUnique = await deptModel.checkDeptNameUniqueModel(deptName, Number(parentId), Number(deptId));
      if (!isUnique) {
        return ctx.body = response.error('部门名称已存在');
      }
    }
    
    // 获取当前登录用户信息
    const { userId, username } = ctx.state.user || {};
    
    const data: any = {
      updatedId: userId,
      updatedBy: username || '',
      updatedAt: now()
    };
    
    if (deptName !== undefined) data.deptName = deptName;
    if (parentId !== undefined) data.parentId = Number(parentId);
    if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);
    if (leader !== undefined) data.leader = leader;
    if (phone !== undefined) data.phone = phone;
    if (email !== undefined) data.email = email;
    if (status !== undefined) data.status = Number(status);
    
    const dept = await deptModel.updateDeptModel(Number(deptId), data);
    return ctx.body = response.success('更新成功', dept);
  } catch (err: any) {
    return ctx.body = response.error(err.message);
  }
};

// 删除部门
export const deleteDeptController = async (ctx: Context) => {
  try {
    const { deptId } = ctx.params;
    if (!deptId) {
      return ctx.body = response.error('部门ID不能为空');
    }
    
    await deptModel.deleteDeptModel(Number(deptId));
    return ctx.body = response.success('删除成功');
  } catch (err: any) {
    return ctx.body = response.error(err.message);
  }
};
