<template>
  <div class="page">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover" class="panel">
          <div slot="header" class="card-header">
            <span>Dialog 与消息提示</span>
          </div>

          <p class="desc">练习常见弹窗、确认框和消息反馈。</p>

          <el-button type="primary" @click="dialogVisible = true">
            打开 Dialog
          </el-button>
          <el-button @click="showConfirm">打开确认框</el-button>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover" class="panel">
          <div slot="header" class="card-header">
            <span>Drawer 侧边抽屉</span>
          </div>

          <p class="desc">练习右侧抽屉和表单类交互。</p>

          <el-button type="success" @click="drawerVisible = true">
            打开 Drawer
          </el-button>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
      title="练习弹窗"
      :visible.sync="dialogVisible"
      width="480px"
    >
      <span>
        这里可以继续放表单、表格或更复杂的内容，这个页面不会影响其他菜单页。
      </span>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmDialog">确定</el-button>
      </span>
    </el-dialog>

    <el-drawer
      title="抽屉示例"
      :visible.sync="drawerVisible"
      size="36%"
      direction="rtl"
    >
      <div class="drawer-body">
        <el-steps :active="2" finish-status="success">
          <el-step title="填写基础信息" />
          <el-step title="确认内容" />
          <el-step title="完成提交" />
        </el-steps>

        <el-divider />

        <el-input
          v-model="note"
          type="textarea"
          :rows="6"
          placeholder="在这里写一些抽屉中的内容"
        />

        <div class="drawer-actions">
          <el-button @click="drawerVisible = false">关闭</el-button>
          <el-button type="primary" @click="submitDrawer">提交</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
export default {
  name: 'DialogPracticeView',
  data() {
    return {
      dialogVisible: false,
      drawerVisible: false,
      note: ''
    }
  },
  methods: {
    confirmDialog() {
      this.dialogVisible = false
      this.$message.success('你点击了确定。')
    },
    showConfirm() {
      this.$confirm('确认执行这个操作吗？', '提示', {
        type: 'warning'
      })
        .then(() => {
          this.$message.success('确认框操作已执行。')
        })
        .catch(() => {
          this.$message.info('你取消了操作。')
        })
    },
    submitDrawer() {
      this.drawerVisible = false
      this.$notify({
        title: '提交成功',
        message: this.note || '你还没有输入内容，这里只是一个练习入口。',
        type: 'success'
      })
    }
  }
}
</script>

<style scoped>
.panel {
  min-height: 180px;
}

.card-header {
  font-weight: 600;
}

.desc {
  margin: 0 0 20px;
  color: #606266;
  line-height: 1.8;
}

.drawer-body {
  padding: 0 20px 20px;
}

.drawer-actions {
  margin-top: 20px;
  text-align: right;
}
</style>
