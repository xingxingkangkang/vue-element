<template>
  <el-container class="app-shell">
    <el-aside width="240px" class="sidebar">
      <div class="brand">
        <div class="brand__title">Vue + Element UI</div>
        <div class="brand__desc">独立菜单路由练习工程</div>
      </div>

      <el-menu
        :default-active="$route.path"
        router
        class="nav-menu"
        background-color="#001529"
        text-color="#c0c4cc"
        active-text-color="#409eff"
      >
        <el-menu-item
          v-for="item in menus"
          :key="item.path"
          :index="item.path"
        >
          <i :class="item.icon"></i>
          <span slot="title">{{ item.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="topbar">
        <div>
          <div class="topbar__title">{{ currentTitle }}</div>
          <div class="topbar__desc">
            当前菜单只加载当前路由页面，便于分别练习组件和状态管理。
          </div>
        </div>
      </el-header>

      <el-main class="page-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { menuRoutes } from '@/router/menuRoutes'

export default {
  name: 'MainLayout',
  computed: {
    menus() {
      return menuRoutes.map((item) => ({
        path: `/${item.path}`,
        title: item.meta.title,
        icon: item.meta.icon
      }))
    },
    currentTitle() {
      const current = this.menus.find((item) => item.path === this.$route.path)
      return current ? current.title : 'Vue + Element UI'
    }
  }
}
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.sidebar {
  background: #001529;
  color: #fff;
}

.brand {
  padding: 24px 20px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.brand__title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}

.brand__desc {
  margin-top: 8px;
  font-size: 12px;
  color: #8c939d;
  line-height: 1.6;
}

.nav-menu {
  border-right: none;
}

.topbar {
  display: flex;
  align-items: center;
  padding: 0 28px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}

.topbar__title {
  font-size: 22px;
  font-weight: 700;
  color: #303133;
}

.topbar__desc {
  margin-top: 6px;
  font-size: 13px;
  color: #909399;
}

.page-main {
  background: #f5f7fa;
}
</style>
