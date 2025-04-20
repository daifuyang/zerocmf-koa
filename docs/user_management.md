# 用户管理模块

## 接口列表
- [获取管理员列表](#获取管理员列表)
- [获取单个管理员](#获取单个管理员)  
- [添加管理员](#添加管理员)
- [修改管理员](#修改管理员)
- [删除管理员](#删除管理员)

## 接口详情

### 获取管理员列表
#### 功能描述
获取管理员用户分页列表，支持按登录名、手机号和状态筛选

#### 请求参数
- current: 当前页码，默认1
- pageSize: 每页条数，默认10（传0获取全部）
- loginName: 登录名模糊查询
- phone: 手机号模糊查询  
- status: 状态筛选（1启用 0禁用）

#### 处理逻辑
1. 构建查询条件：
   - 固定userType=1（管理员类型）
   - 根据参数动态添加loginName/phone/status条件
2. 调用getUserListModel获取分页数据
3. 格式化时间字段：
   - loginAt → loginTime
   - createdAt → createTime  
   - updatedAt → updateTime
4. 移除password敏感字段
5. 计算总数并返回分页结构

#### 返回结果
```typescript
{
  page: number, // 当前页
  pageSize: number, // 每页条数
  total: number, // 总条数
  data: Array<{
    userId: number,
    loginName: string,
    // ...其他字段
  }>
}
```

### 获取单个管理员
#### 功能描述
根据用户ID获取管理员详情，包含关联的角色ID列表

#### 请求参数
- userId: 用户ID（路径参数）

#### 处理逻辑  
1. 参数校验：userId必填
2. 调用getUserByIdModel查询用户
3. 移除password字段
4. 通过Casbin获取用户角色列表
5. 返回用户详情+角色IDs

#### 返回结果
```typescript
{
  userId: number,
  loginName: string,
  // ...其他用户字段
  roleIds: number[] // 关联角色ID数组
}
```

### 添加管理员
#### 功能描述
创建新的管理员账号

#### 请求参数
```typescript
{
  loginName: string, // 必填
  password: string,  // 必填（新增时）
  email?: string,
  phone?: string,
  nickname?: string,
  realname?: string, 
  gender?: number,
  birthday?: string,
  avatar?: string,
  status?: number,
  remark?: string,
  roleIds?: number[] // 关联角色IDs
}
```

#### 处理逻辑
1. 参数校验：
   - loginName必填且唯一
   - password必填（新增时）
   - phone/email唯一性校验
2. 密码处理：
   - 生成salt
   - 使用hashPassword加密(password+salt)
3. 设置默认值：
   - userType=1（管理员）
   - 当前时间作为createdAt/updatedAt
4. 调用createUserModel创建用户
5. 分配角色（如有roleIds）

#### 返回结果
返回创建的用户对象（不含password）

### 修改管理员
#### 功能描述
修改管理员账号信息

#### 请求参数
同添加接口，但：
- password变为可选（不传则保持原密码）
- 通过路径参数userId指定要修改的用户

#### 处理逻辑  
1. 校验用户是否存在
2. 参数校验：
   - loginName唯一性校验（排除自身）
   - phone/email唯一性校验（排除自身）
3. 密码处理：
   - 如果传了新password，重新生成salt和hash
   - 否则保持原密码
4. 调用updateUserModel更新
5. 更新角色关联（全量覆盖）

#### 返回结果
返回更新后的用户对象（不含password）

### 删除管理员
#### 功能描述
删除指定管理员账号

#### 请求参数
- userId: 用户ID（路径参数）

#### 处理逻辑
1. 参数校验：userId必填且有效
2. 校验用户是否存在  
3. 调用deleteUserModel删除
4. Casbin中自动清理相关角色关联

#### 返回结果
返回被删除的用户对象基本信息

## 公共方法说明

### saveUser方法
添加和修改共用的核心逻辑：
1. 参数校验
2. 唯一性检查
3. 密码处理
4. 数据保存
5. 角色分配
