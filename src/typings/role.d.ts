export interface Role {
  /**
   * 角色id
   */
  id: number;
  /**
   * 角色名称
   */
  name: string;
  /**
   * 角色描述
   */
  description: string;
  /**
   * 排序
   */
  sort?: number;
  /* 
   * 状态
  */
  status?: number;
}
