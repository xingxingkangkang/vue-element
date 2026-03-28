<template>
  <div class="page">
    <el-card shadow="never">
      <div slot="header" class="toolbar">
        <span class="card-header">表格练习</span>
        <el-tag type="info">共 {{ tableData.length }} 条数据</el-tag>
      </div>

      <el-table :data="tableData" border stripe style="width: 100%;">
        <el-table-column prop="name" label="项目名称" min-width="180" />
        <el-table-column prop="owner" label="负责人" min-width="120" />
        <el-table-column label="状态" min-width="140">
          <template slot-scope="{ row }">
            <el-tag :type="statusMap[row.status]">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="进度" min-width="180">
          <template slot-scope="{ row }">
            <el-progress
              :percentage="row.progress"
              :status="row.progress === 100 ? 'success' : undefined"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="{ row }">
            <el-button type="text" @click="viewRow(row)">查看</el-button>
            <el-button type="text" @click="removeRow(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="footer">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="40"
          :page-size="10"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'TablePracticeView',
  data() {
    return {
      statusMap: {
        进行中: 'warning',
        已完成: 'success',
        未开始: 'info'
      },
      tableData: [
        {
          id: 1,
          name: '后台首页改版',
          owner: '张三',
          status: '进行中',
          progress: 72
        },
        {
          id: 2,
          name: '用户管理模块',
          owner: '李四',
          status: '已完成',
          progress: 100
        },
        {
          id: 3,
          name: '订单分析看板',
          owner: '王五',
          status: '未开始',
          progress: 0
        },
        {
          id: 4,
          name: 'Element UI 学习页',
          owner: '赵六',
          status: '进行中',
          progress: 45
        }
      ]
    }
  },
  methods: {
    viewRow(row) {
      this.$alert(
        `项目：${row.name}\n负责人：${row.owner}\n当前状态：${row.status}`,
        '项目详情',
        {
          confirmButtonText: '知道了'
        }
      )
    },
    removeRow(id) {
      this.tableData = this.tableData.filter((item) => item.id !== id)
      this.$message.success('已删除当前行。')
    }
  }
}
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header {
  font-weight: 600;
}

.footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
