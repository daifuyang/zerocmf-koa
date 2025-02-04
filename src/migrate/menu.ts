export const systemMenus = [
  {
    perms: "user",
    menuName: "管理员",
    path: "/user",
    children: [
      {
        perms: "user:admin",
        menuName: "管理员管理",
        path: "/user/admin",
        children: [
          {
            perms: "user:admin:list",
            menuName: "管理员列表",
            path: "/user/admin/list",
            visible: 0,
            menuType: 1
          },
          {
            perms: "user:admin:add",
            menuName: "添加管理员",
            path: "/user/admin/add",
            visible: 0,
            menuType: 2
          },
          {
            perms: "user:admin:edit",
            menuName: "编辑管理员",
            path: "/user/admin/edit/:id",
            visible: 0,
            menuType: 2
          },
          {
            perms: "user:admin:delete",
            menuName: "删除管理员",
            path: "/user/admin/delete/:id",
            visible: 0,
            menuType: 2
          }
        ]
      },
      {
        perms: "user:role",
        menuName: "角色管理",
        path: "/user/role",
        children: [
          {
            perms: "user:role:list",
            menuName: "角色列表",
            path: "/user/role/list",
            visible: 0,
            menuType: 1
          },
          {
            perms: "user:role:add",
            menuName: "添加角色",
            path: "/user/role/add",
            visible: 0,
            menuType: 2
          },
          {
            perms: "user:role:edit",
            menuName: "编辑角色",
            path: "/user/role/edit/:id",
            visible: 0,
            menuType: 2
          },
          {
            perms: "user:role:delete",
            menuName: "删除角色",
            path: "/user/role/delete/:id",
            visible: 0,
            menuType: 2
          }
        ]
      }
    ]
  },
  {
    perms: "system",
    menuName: "系统管理",
    path: "/system",
    children: [
      {
        perms: "system:menu",
        menuName: "菜单管理",
        path: "/system/menu",
        children: [
          {
            perms: "system:menu:list",
            menuName: "菜单列表",
            path: "/system/menu/list",
            visible: 0,
            menuType: 1
          },
          {
            perms: "system:menu:add",
            menuName: "添加菜单",
            path: "/system/menu/add",
            visible: 0,
            menuType: 2
          },
          {
            perms: "system:menu:edit",
            menuName: "编辑菜单",
            path: "/system/menu/edit/:id",
            visible: 0,
            menuType: 2
          },
          {
            perms: "system:menu:delete",
            menuName: "删除菜单",
            path: "/system/menu/delete/:id",
            visible: 0,
            menuType: 2
          }
        ]
      },
      {
        perms: "system:department",
        menuName: "部门管理",
        path: "/system/department",
        children: [
          {
            perms: "system:department:list",
            menuName: "部门列表",
            path: "/system/department/list",
            visible: 0,
            menuType: 1
          },
          {
            perms: "system:department:add",
            menuName: "添加部门",
            path: "/system/department/add",
            visible: 0,
            menuType: 2
          },
          {
            perms: "system:department:edit",
            menuName: "编辑部门",
            path: "/system/department/edit/:id",
            visible: 0,
            menuType: 2
          },
          {
            perms: "system:department:delete",
            menuName: "删除部门",
            path: "/system/department/delete/:id",
            visible: 0,
            menuType: 2
          }
        ]
      },
      {
        perms: "system:post",
        menuName: "岗位管理",
        path: "/system/post",
        children: [
          {
            perms: "system:post:list",
            menuName: "岗位列表",
            path: "/system/post/list",
            visible: 0,
            menuType: 1
          },
          {
            perms: "system:post:add",
            menuName: "添加岗位",
            path: "/system/post/add",
            visible: 0,
            menuType: 2
          },
          {
            perms: "system:post:edit",
            menuName: "编辑岗位",
            path: "/system/post/edit/:id",
            visible: 0,
            menuType: 2
          },
          {
            perms: "system:post:delete",
            menuName: "删除岗位",
            path: "/system/post/delete/:id",
            visible: 0,
            menuType: 2
          }
        ]
      },
      {
        perms: "system:dict",
        menuName: "字典管理",
        path: "/system/dict",
        children: [
          {
            perms: "system:dict:list",
            menuName: "字典列表",
            path: "/system/dict/list",
            visible: 0,
            menuType: 1
          },
          {
            perms: "system:dict:add",
            menuName: "添加字典",
            path: "/system/dict/add",
            visible: 0,
            menuType: 2
          },
          {
            perms: "system:dict:edit",
            menuName: "编辑字典",
            path: "/system/dict/edit/:id",
            visible: 0,
            menuType: 2
          },
          {
            perms: "system:dict:delete",
            menuName: "删除字典",
            path: "/system/dict/delete/:id",
            visible: 0,
            menuType: 2
          }
        ]
      },
      {
        perms: "system:log",
        menuName: "日志管理",
        path: "/system/log",
        children: [
          {
            perms: "system:log:list",
            menuName: "日志列表",
            path: "/system/log/list",
            visible: 0,
            menuType: 1
          }
        ]
      }
    ]
  }
];

export const migrateMenu = async (menus: any) => {
  if (menus) {
    systemMenus.push(...menus);
    return systemMenus;
  }
  return [];
};
