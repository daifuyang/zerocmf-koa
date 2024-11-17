export interface JsonResult<T> {
  code: number;
  msg: string;
  data: T | null;
}

const json: JsonResult<null> = {
  code: 1,
  msg: "",
  data: null
};

function success(msg: string, data: any = null) {
  json.code = 1;
  json.msg = msg;
  json.data = data;
  return json;
}

function error(msg: string, data: any = null) {
  json.code = 0;
  json.msg = msg;
  json.data = data;
  return json;
}

function errorWithCode(code: number, msg: string, data: any = null) {
  json.code = code;
  json.msg = msg;
  json.data = data;
  return json;
}

export type Pagination<T> = {
  total: number;
  data: T[];
  current: number;
  pageSize: number;
};

const response = {
  success,
  error,
  errorWithCode
};

export default response;
