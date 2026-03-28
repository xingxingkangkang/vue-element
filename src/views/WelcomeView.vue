<template>
  <div class="page">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card shadow="never" class="hero-card">
          <div slot="header" class="card-header">
            <span>工程说明</span>
          </div>
          <h2>这是一个专门拿来练习 Vue 2、Vue Router 和 Element UI 的基础工程。</h2>
          <p>
            左侧每个菜单都对应一个独立路由组件。你可以直接在某个页面里改布局、加表单、加表格或改交互，不会和其他菜单页混在一起。
          </p>
          <el-alert
            title="建议做法：每次只改一个页面，逐个熟悉 Element UI 组件。"
            type="success"
            :closable="false"
            show-icon
          />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="side-card">
          <div slot="header" class="card-header">
            <span>学习路径</span>
          </div>
          <el-steps direction="vertical" :active="4">
            <el-step title="先看布局" description="熟悉整体左右结构"></el-step>
            <el-step title="练表单" description="掌握输入、校验、重置"></el-step>
            <el-step title="练表格" description="掌握表格、标签、进度"></el-step>
            <el-step title="练弹层" description="掌握 Dialog、Drawer"></el-step>
          </el-steps>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="section">
      <el-col :span="8">
        <el-card shadow="hover">
          <div slot="header" class="card-header">
            <span>菜单与路由</span>
          </div>
          <ul class="plain-list">
            <li>左侧菜单使用 `el-menu`。</li>
            <li>点击菜单直接切换到对应路由。</li>
            <li>右侧内容区通过 `router-view` 渲染。</li>
          </ul>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div slot="header" class="card-header">
            <span>页面独立性</span>
          </div>
          <ul class="plain-list">
            <li>每个页面都是独立 `.vue` 文件。</li>
            <li>每个页面各自维护数据和交互。</li>
            <li>适合逐页练习和拆分实验。</li>
          </ul>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div slot="header" class="card-header">
            <span>你可以继续做的事</span>
          </div>
          <ul class="plain-list">
            <li>再新增菜单页练习树、上传、穿梭框。</li>
            <li>把某个页面拆成子组件。</li>
            <li>尝试加入接口请求和状态管理。</li>
          </ul>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hero-card h2 {
  margin: 0 0 14px;
  font-size: 26px;
  line-height: 1.4;
  color: #303133;
}

.hero-card p {
  margin: 0 0 18px;
  line-height: 1.8;
  color: #606266;
}

.side-card {
  height: 100%;
}

.section {
  margin-top: 0;
}

.card-header {
  font-weight: 600;
  color: #303133;
}

.plain-list {
  margin: 0;
  padding-left: 18px;
  line-height: 2;
  color: #606266;
}
</style>
