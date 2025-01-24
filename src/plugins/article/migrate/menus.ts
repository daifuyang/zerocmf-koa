const menus = [
  {
    perms: "article",
    menuName: "文章管理",
    path: "/article",
    children: [
      {
        perms: "article:list",
        menuName: "文章列表",
        path: "/article/list",
        visible: 1,
        menuType: 1
      },
      {
        perms: "article:view",
        menuName: "查看文章",
        path: "/article/detail/:id",
        visible: 0,
        menuType: 2
      },
      {
        perms: "article:add",
        menuName: "添加文章",
        path: "/article/add",
        visible: 0,
        menuType: 2
      },
      {
        perms: "article:edit",
        menuName: "编辑文章",
        path: "/article/edit/:id",
        visible: 0,
        menuType: 2
      },
      {
        perms: "article:delete",
        menuName: "删除文章",
        path: "/article/delete/:id",
        visible: 0,
        menuType: 2
      },
      {
        perms: "article-category",
        menuName: "文章分类",
        path: "/article/category",
        visible: 1,
        menuType: 1,
        children: [
          {
            perms: "article-category:list",
            menuName: "分类列表",
            path: "/article/category/list",
            visible: 0,
            menuType: 1
          },
          {
            perms: "article-category:view",
            menuName: "查看分类",
            path: "/article/category/detail/:id",
            visible: 0,
            menuType: 2
          },
          {
            perms: "article-category:add",
            menuName: "添加分类",
            path: "/article/category/add",
            visible: 0,
            menuType: 2
          },
          {
            perms: "article-category:edit",
            menuName: "编辑分类",
            path: "/article/category/edit/:id",
            visible: 0,
            menuType: 2
          },
          {
            perms: "article-category:delete",
            menuName: "删除分类",
            path: "/article/category/delete/:id",
            visible: 0,
            menuType: 2
          }
        ]
      },
      {
        perms: "article-tag",
        menuName: "文章标签",
        path: "/article/tag",
        visible: 1,
        menuType: 1,
        children: [
          {
            perms: "article-tag:list",
            menuName: "标签列表",
            path: "/article/tag/list",
            visible: 0,
            menuType: 1
          }
        ]
      }
    ]
  }
];

export default menus;
