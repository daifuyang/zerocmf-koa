# 字典管理

## 字典类型管理

### 字典类型列表 getDictTypeListController

- 请求方式：GET
- 请求路径：/system/dict/type/list
- 请求参数：
  - dictName：字典名称（可选）
  - dictType：字典类型（可选）
  - status：状态（可选，0停用 1正常）
  - pageSize：每页条数（可选，默认10）
  - current：当前页码（可选，默认1）

### 新增字典类型 addDictTypeController

- 请求方式：POST
- 请求路径：/system/dict/type
- 请求参数：
  - dictName：字典名称（必填）
  - dictType：字典类型（必填，唯一）
  - status：状态（必填，0停用 1正常）
  - remark：备注（可选）

### 修改字典类型 updateDictTypeController

- 请求方式：PUT
- 请求路径：/system/dict/type
- 请求参数：
  - dictId：字典主键（必填）
  - dictName：字典名称（必填）
  - dictType：字典类型（必填，唯一）
  - status：状态（必填，0停用 1正常）
  - remark：备注（可选）

### 删除字典类型 deleteDictTypeController

- 请求方式：DELETE
- 请求路径：/system/dict/type/:dictId
- 请求参数：
  - dictId：字典主键（必填，路径参数）

## 字典数据管理

### 字典数据列表 getDictDataListController

- 请求方式：GET
- 请求路径：/system/dict/data/list
- 请求参数：
  - dictType：字典类型（必填）
  - dictLabel：字典标签（可选）
  - status：状态（可选，0停用 1正常）

### 新增字典数据 addDictDataController

- 请求方式：POST
- 请求路径：/system/dict/data
- 请求参数：
  - dictSort：字典排序（必填）
  - dictLabel：字典标签（必填）
  - dictValue：字典键值（必填）
  - dictType：字典类型（必填）
  - cssClass：样式属性（可选）
  - listClass：表格回显样式（可选）
  - isDefault：是否默认（必填，0否 1是）
  - status：状态（必填，0停用 1正常）
  - remark：备注（可选）

### 修改字典数据 updateDictDataController

- 请求方式：PUT
- 请求路径：/system/dict/data
- 请求参数：
  - dictCode：字典编码（必填）
  - dictSort：字典排序（必填）
  - dictLabel：字典标签（必填）
  - dictValue：字典键值（必填）
  - dictType：字典类型（必填）
  - cssClass：样式属性（可选）
  - listClass：表格回显样式（可选）
  - isDefault：是否默认（必填，0否 1是）
  - status：状态（必填，0停用 1正常）
  - remark：备注（可选）

### 删除字典数据 deleteDictDataController

- 请求方式：DELETE
- 请求路径：/system/dict/data/:dictCode
- 请求参数：
  - dictCode：字典编码（必填，路径参数）

