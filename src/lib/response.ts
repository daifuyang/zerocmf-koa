import { convertToJson } from "./utils";

export interface JsonResult<T> {
  code: number;
  msg: string;
  data: T | null;
  current?: number;
  pageSize?: number;
  total?: number;
}

export interface Pagination {
  current: number;
  pageSize: number;
  total: number;
}

interface Params {
  pagination?: Pagination;
}

const json: JsonResult<null> = {
  code: 1,
  msg: "",
  data: null
};

function success<T>(msg: string, data: T = null, params: Params = {}) {
  const { pagination } = params;

  json.code = 1;
  json.msg = msg;
  json.data = convertToJson(data);

  if (pagination) {
    json.current = pagination.current;
    json.pageSize = pagination.pageSize;
    json.total = pagination.total;
  }

  return json;
}

function error(msg: string, data: any = null, log = false) {
  json.code = 0;
  json.msg = msg;
  json.data = convertToJson(data);
  return json;
}

function errorWithCode(code: number, msg: string, data: any = null) {
  json.code = code;
  json.msg = msg;
  json.data = convertToJson(data);
  return json;
}

const response = {
  success,
  error,
  errorWithCode
};

export default response;
