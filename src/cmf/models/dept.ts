import { formatFields, now } from "@/lib/date";
import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import { serializeData } from "@/lib/util";
import { Prisma } from "@prisma/client";

const deptIdKey = "dept:id:";

// 获取部门列表
export const getDeptList = async (
  where: Prisma.sysDeptWhereInput = {},
  tx = prisma
) => {
  const args: {
    where?: Prisma.sysDeptWhereInput;
    orderBy?: Prisma.sysDeptOrderByWithRelationInput;
  } = {};

  args.where = {
    ...where,
    deletedAt: 0
  };

  args.orderBy = {
    sortOrder: 'asc'
  };

  const depts = await tx.sysDept.findMany({
    ...args
  });

  formatFields(depts, [
    { fromField: "createdAt", toField: "createTime" },
    { fromField: "updatedAt", toField: "updateTime" }
  ]);

  return depts;
};

// 根据id获取部门详情
export const getDeptById = async (deptId: number, tx = prisma) => {
  const cache = await redis.get(`${deptIdKey}${deptId}`);
  if (cache) {
    return JSON.parse(cache);
  }

  const dept = await tx.sysDept.findUnique({
    where: {
      deptId,
      deletedAt: 0
    }
  });

  if (dept) {
    redis.set(`${deptIdKey}${deptId}`, serializeData(dept));
  }

  return dept;
};

// 根据部门名称获取部门
export const getDeptByName = async (deptName: string, parentId: number = 0, tx = prisma) => {
  return await tx.sysDept.findFirst({
    where: {
      deptName,
      parentId,
      deletedAt: 0
    }
  });
};

// 获取部门总数
export const getDeptCount = async (where: Prisma.sysDeptWhereInput = {}, tx = prisma) => {
  return await tx.sysDept.count({
    where: {
      ...where,
      deletedAt: 0
    }
  });
};

// 创建部门
export const createDept = async (data: any, tx = prisma) => {
  // 处理祖级列表
  if (data.parentId > 0) {
    const parentDept = await getDeptById(data.parentId, tx);
    if (parentDept && parentDept.ancestors) {
      data.ancestors = `${parentDept.ancestors},${data.parentId}`;
    } else {
      data.ancestors = `${data.parentId}`;
    }
  } else {
    data.ancestors = '0';
  }
  
  const dept = await tx.sysDept.create({
    data
  });
  
  return dept;
};

// 更新部门
export const updateDept = async (deptId: number, data: Prisma.sysDeptUpdateInput, tx = prisma) => {
  // 如果更新了父部门，需要更新祖级列表
  if (data.parentId !== undefined) {
    const parentId = data.parentId as number;
    if (parentId > 0) {
      const parentDept = await getDeptById(parentId, tx);
      if (parentDept && parentDept.ancestors) {
        data.ancestors = `${parentDept.ancestors},${parentId}`;
      } else {
        data.ancestors = `${parentId}`;
      }
    } else {
      data.ancestors = '0';
    }
    
    // 更新所有子部门的祖级列表
    await updateChildrenDeptAncestors(deptId, data.ancestors as string, tx);
  }
  
  const dept = await tx.sysDept.update({
    where: {
      deptId
    },
    data
  });
  
  if (dept) {
    redis.del(`${deptIdKey}${deptId}`);
  }
  
  return dept;
};

// 更新子部门的祖级列表
async function updateChildrenDeptAncestors(deptId: number, ancestors: string, tx = prisma) {
  // 查找所有子部门
  const childrenDepts = await tx.sysDept.findMany({
    where: {
      parentId: deptId,
      deletedAt: 0
    }
  });
  
  for (const child of childrenDepts) {
    // 更新子部门的祖级列表
    const newAncestors = `${ancestors},${deptId}`;
    await tx.sysDept.update({
      where: {
        deptId: child.deptId
      },
      data: {
        ancestors: newAncestors
      }
    });
    
    // 递归更新子部门的子部门
    await updateChildrenDeptAncestors(child.deptId, newAncestors, tx);
  }
}

// 删除部门
export const deleteDept = async (deptId: number, tx = prisma) => {
  // 检查是否有子部门
  const childCount = await tx.sysDept.count({
    where: {
      parentId: deptId,
      deletedAt: 0
    }
  });
  
  if (childCount > 0) {
    throw new Error('存在子部门，不允许删除');
  }
  
  // 检查是否有关联用户
  const userCount = await tx.sysUserDept.count({
    where: {
      deptId
    }
  });
  
  if (userCount > 0) {
    throw new Error('部门存在关联用户，不允许删除');
  }
  
  const dept = await tx.sysDept.update({
    where: {
      deptId
    },
    data: {
      deletedAt: now()
    }
  });
  
  if (dept) {
    redis.del(`${deptIdKey}${deptId}`);
  }
  
  return dept;
};

// 检查部门名称是否唯一
export const checkDeptNameUnique = async (deptName: string, parentId: number, deptId: number = 0, tx = prisma) => {
  const dept = await tx.sysDept.findFirst({
    where: {
      deptName,
      parentId,
      deletedAt: 0,
      NOT: deptId > 0 ? { deptId } : undefined
    }
  });
  
  return !dept;
};

// 根据用户ID获取部门列表
export const getDeptsByUserId = async (userId: number, tx = prisma) => {
  const userDepts = await tx.sysUserDept.findMany({
    where: {
      userId
    }
  });
  
  const deptIds = userDepts.map(ud => ud.deptId);
  
  if (deptIds.length === 0) {
    return [];
  }
  
  return await tx.sysDept.findMany({
    where: {
      deptId: {
        in: deptIds
      },
      deletedAt: 0
    }
  });
};

// 获取部门树结构
export const getDeptTree = async (where: any = {}, tx = prisma) => {
  // 获取符合条件的部门列表
  const depts = await getDeptList(where, tx);
  
  // 直接构建树形结构
  return buildDeptTree(depts);
};

// 构建部门树结构
function buildDeptTree(depts: any[]) {
  const deptMap = new Map(depts.map(dept => [dept.deptId, dept]));
  const tree: any[] = [];

  // 建立父子关系映射（支持搜索模式）
  depts.forEach(dept => {
    const parentId = dept.parentId;
    // 当父节点存在于当前结果集时才建立父子关系
    if (deptMap.has(parentId)) {
      const parent = deptMap.get(parentId);
      if (!parent.children) parent.children = [];
      parent.children.push(dept);
    } else {
      // 允许单独节点成为根节点
      tree.push(dept);
    }
  });

  // 最后过滤掉没有子节点且不符合条件的空父节点
  return tree.filter(dept => 
    dept.children?.length > 0 ||  // 保留有子节点的
    !deptMap.has(dept.parentId)    // 保留本身就是叶子节点的
  );
}