const menus = [
  {
    perms: "mbcrm:hospital",
    menuName: "医院管理",
    path: "/mbcrm/hospital",
    children: [
      {
        perms: "mbcrm:hospital:list",
        menuName: "医院列表",
        path: "/mbcrm/hospital/list"
      },
      {
        perms: "mbcrm:hospital:create",
        menuName: "创建医院",
        path: "/mbcrm/hospital/create",
        visible: 0,
        menuType: 1
      },
      {
        perms: "mbcrm:hospital:edit",
        menuName: "编辑医院",
        path: "/mbcrm/hospital/edit/:hospitalId",
        visible: 0,
        menuType: 1
      }
    ]
  },
  {
    perms: "mbcrm:customer",
    menuName: "客户管理",
    path: "/mbcrm/customer",
    children: [
      {
        perms: "mbcrm:customer:list",
        menuName: "客户列表",
        path: "/mbcrm/customer/list"
      },
    ]
  }
];

export default menus;
