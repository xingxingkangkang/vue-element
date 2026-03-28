<template>
  <div class="page">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card shadow="never">
          <div slot="header" class="card-header">
            <span>Tabs 练习</span>
          </div>

          <el-tabs v-model="activeTab">
            <el-tab-pane label="卡片区" name="cards">
              <el-row :gutter="16">
                <el-col :span="12" v-for="item in cards" :key="item.title">
                  <el-card shadow="hover" class="mini-card">
                    <h3>{{ item.title }}</h3>
                    <p>{{ item.desc }}</p>
                    <el-button type="text">继续查看</el-button>
                  </el-card>
                </el-col>
              </el-row>
            </el-tab-pane>

            <el-tab-pane label="折叠面板" name="collapse">
              <el-collapse v-model="activePanels">
                <el-collapse-item title="为什么要拆分独立页面？" name="1">
                  每个路由单独维护数据和交互，改动更清晰，也更适合学习。
                </el-collapse-item>
                <el-collapse-item title="可以练什么？" name="2">
                  可以练表单、表格、弹窗、上传、树形控件、穿梭框等。
                </el-collapse-item>
                <el-collapse-item title="下一步怎么做？" name="3">
                  再新增几个菜单路由，把复杂组件拆成专门页面继续练。
                </el-collapse-item>
              </el-collapse>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover">
          <div slot="header" class="card-header">
            <span>时间线</span>
          </div>
          <el-timeline>
            <el-timeline-item
              v-for="item in timeline"
              :key="item.content"
              :timestamp="item.time"
            >
              {{ item.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'CardPracticeView',
  data() {
    return {
      activeTab: 'cards',
      activePanels: ['1'],
      cards: [
        {
          title: '组件拆分',
          desc: '把同类内容拆成子组件，练习 props 和事件。'
        },
        {
          title: '样式练习',
          desc: '尝试调整卡片阴影、边距、排版和配色。'
        },
        {
          title: '数据驱动',
          desc: '用数组渲染内容，练习 v-for 和响应式。'
        },
        {
          title: '交互扩展',
          desc: '继续加收藏、删除、切换状态等操作。'
        }
      ],
      timeline: [
        {
          time: '09:00',
          content: '搭建左侧菜单 + 路由结构'
        },
        {
          time: '10:30',
          content: '完成表单和表格练习页'
        },
        {
          time: '14:00',
          content: '补充弹层与卡片类组件练习'
        }
      ]
    }
  }
}
</script>

<style scoped>
.card-header {
  font-weight: 600;
}

.mini-card {
  margin-bottom: 16px;
}

.mini-card h3 {
  margin: 0 0 8px;
  color: #303133;
}

.mini-card p {
  margin: 0;
  min-height: 48px;
  line-height: 1.7;
  color: #606266;
}
</style>
