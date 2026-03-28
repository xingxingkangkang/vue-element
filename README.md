# vue-element

一个基于 Vue 2、Vue Router 和 Element UI 的练习型工程，用来按菜单拆分页面、独立练习常见中后台组件和业务界面。

## 项目特点

- 基于 `Vue 2.7` + `Element UI 2`
- 使用 `Vue Router` 管理菜单和页面切换
- 采用左侧导航 + 顶部标题的中后台布局
- 每个练习页面独立维护，便于逐页扩展

## 当前页面

- 开始页
- 表单练习
- 表格练习
- 弹层练习
- 卡片与标签
- 验印算法验证
- 生成验证任务

## 技术栈

- Vue 2.7
- Vue Router 3
- Element UI 2
- Vue CLI 5

## 本地启动

先安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run serve
```

构建生产包：

```bash
npm run build
```

## 目录结构

```text
.
├─ public/
├─ src/
│  ├─ layout/          # 页面整体布局
│  ├─ router/          # 路由与菜单配置
│  ├─ views/           # 各个练习页面
│  ├─ App.vue
│  └─ main.js
├─ babel.config.js
├─ jsconfig.json
├─ vue.config.js
└─ package.json
```

## 路由设计

项目使用统一的 `MainLayout` 承载页面框架，菜单数据集中定义在 `src/router/menuRoutes.js`，路由再根据菜单配置自动生成。这样可以让页面结构和导航配置保持一致，也方便后续继续新增练习模块。

## 适用场景

- 学习 Vue 2 和 Element UI 的基础组件使用
- 快速搭建后台管理类页面原型
- 沉淀表单、表格、弹窗、卡片等常见页面模板

## 后续可继续完善

- 增加 `README` 页面截图
- 为每个练习页补充交互说明
- 增加接口模拟或本地 mock 数据
- 补充代码规范和提交规范
