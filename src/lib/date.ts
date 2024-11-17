import dayjs from "dayjs";

export function now() {
  return Math.floor(new Date().getTime() / 1000);
}

interface Mapping {
  fromField: string;
  toField: string;
  format?: string;
}

interface DataItem {
  [key: string]: any;
}

/**
 * 格式化数组对象中的多个指定字段，并生成新的字段
 * @param {DataItem[]} data - 包含对象的数组
 * @param {Mapping[]} mappings - 映射数组，包含多个映射对象，每个对象包含fromField、toField和format
 * @return {DataItem[]} - 返回新的数组对象，包含新的格式化字段
 */
export function formatFields(data: DataItem[], mappings: Mapping[]) {
  data.forEach((item: any) => {
    mappings.forEach((mapping) => {
      const { fromField, toField, format = "YYYY-MM-DD HH:mm:ss" } = mapping;
      if (item[fromField]) {
        item[toField] = dayjs.unix(Number(item[fromField])).format(format); 
      }
    });
  });
}


export function calculateExpiresAt(jwtExpire: string) {
  const match = jwtExpire.match(/(\d+)([a-zA-Z]+)/);
  if (!match) throw new Error('Invalid jwtExpire format');
  
  const value = parseInt(match[1], 10);
  const unit = match[2] as dayjs.ManipulateType; // 将字符串类型转换为dayjs的类型
  
  return dayjs().add(value, unit).unix();
}