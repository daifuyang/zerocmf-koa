import { Context } from "koa";

/**
 * 登录请求参数
 */
export interface LoginRequest {
  account: string;
  password: string;
  loginType?: string;
  phoneType?: string;
}

/**
 * 当前用户请求参数
 */
export interface CurrentUserRequest {
  headers: {
    authorization?: string;
  };
}

/**
 * 通用分页请求参数
 */
export interface PaginationRequest {
  current?: number;
  pageSize?: number;
}

/**
 * 媒体请求参数
 */
export interface MediaRequest {
  remarkName?: string;
  type?: number;
  categoryId?: number;
}

export interface MediaFile {
  filepath: string;
  newFilename: string;
  originalFilename: string;
  mimetype: string;
  size: number;
}

export interface MediaFiles {
  file?: MediaFile | MediaFile[];
}

export interface DeptRequest {
  deptName?: string;
  parentId?: number;
  sortOrder?: number;
  leader?: string;
  phone?: string;
  email?: string;
  status?: number;
}

export interface DeptWhere {
  deptName?: {
    contains: string;
  };
  leader?: {
    contains: string;
  };
  createdAt?: {
    gte?: number;
    lte?: number;
  };
  status?: number;
}

export interface DictRequest {
  dictName?: string;
  dictType?: string;
  status?: number;
  remark?: string;
  updatedAt?: number;
  updatedId?: number;
  updatedBy?: string;
  createdAt?: number;
  createdId?: number;
  createdBy?: string;
}

export interface DictWhere {
  dictName?: {
    contains: string;
  };
  dictType?: {
    contains: string;
  };
  status?: number;
}

export interface DictDataRequest {
  dictSort?: number;
  dictLabel?: string;
  dictValue?: string;
  dictType?: string;
  cssClass?: string;
  listClass?: string;
  isDefault?: number;
  status?: number;
  remark?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface DictDataBatchDeleteRequest {
  dictCodes: number[];
}

export interface DictDataWhere {
  dictType?: string;
  dictLabel?: {
    contains: string;
  };
}

export interface PostRequest {
  postCode: string;
  postName: string;
  sortOrder?: number;
  status?: number;
  remark?: string;
}
