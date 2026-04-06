<template>
  <div class="org-seal-change-page">
    <el-card shadow="never" class="query-card">
      <div slot="header" class="card-header">
        <span>查询条件</span>
      </div>

      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="机构号">
          <el-input
            v-model.trim="queryForm.orgCode"
            clearable
            placeholder="请输入机构号"
            maxlength="6"
          />
        </el-form-item>

        <el-form-item label="执行状态">
          <el-select
            v-model="queryForm.procStatus"
            clearable
            placeholder="全部状态"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="执行时间">
          <el-date-picker
            v-model="queryForm.executeTimeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            format="yyyy-MM-dd HH:mm:ss"
            :default-time="defaultTime"
            class="time-range"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-alert
        title="当前为前端 mock 数据，已预留查询、汇总、修改、删除接口方法，后端联调时可直接替换接口层。"
        type="info"
        :closable="false"
        show-icon
      />
    </el-card>


    <el-card shadow="never" class="table-card">
      <div slot="header" class="card-header card-header--between">
        <span>机构印模转换记录</span>
        <div class="table-header-actions">
          <el-tag type="info">共 {{ total }} 条</el-tag>
          <el-button size="mini" @click="handleRefresh">刷新</el-button>
        </div>
      </div>

      <el-table v-loading="tableLoading" :data="tableData" border stripe>
        <el-table-column prop="orgCode" label="机构号" min-width="110" />
        <el-table-column prop="accountCnt" label="账户数" min-width="100" />
        <el-table-column label="执行状态" min-width="120">
          <template slot-scope="{ row }">
            <el-tag :type="statusTagType(row.procStatus)">
              {{ statusText(row.procStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="procCnt" label="执行账户数" min-width="120" />
        <el-table-column label="执行进度" min-width="220">
          <template slot-scope="{ row }">
            <div class="table-progress">
              <el-progress
                :percentage="rowProgressPercent(row)"
                :status="row.procStatus === '1' ? 'success' : undefined"
              />
              <span class="table-progress__text">
                {{ row.procCnt }}/{{ row.accountCnt }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="invalidImageCnt" label="无效影像数量" min-width="130" />
        <el-table-column prop="updateTime" label="更新时间" min-width="180" />
        <el-table-column label="操作" width="160" fixed="right">
          <template slot-scope="{ row }">
            <el-button type="text" @click="handleOpenEdit(row)">修改</el-button>
            <el-button type="text" class="danger-text" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="pagination.pageNum"
          :page-size="pagination.pageSize"
          :page-sizes="pageSizes"
          :total="total"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <el-card v-loading="summaryLoading" shadow="never" class="summary-card">
      <div slot="header" class="card-header card-header--between">
        <span>机构执行情况汇总</span>
        <el-tag type="info">
          共 {{ summary.orgCount }} 家机构，账户总数 {{ summary.accountCnt }}
        </el-tag>
      </div>

      <div class="summary-layout">
        <div class="summary-panel summary-panel--accent">
          <div class="summary-panel__eyebrow">账户执行占比</div>
          <div class="summary-panel__title">执行账户数 / 总账户数</div>

          <div class="progress-ring-wrap">
            <div class="progress-ring" :style="progressRingStyle">
              <div class="progress-ring__inner">
                <div class="progress-ring__percent">{{ progressPercent }}%</div>
                <div class="progress-ring__meta">执行占比</div>
              </div>
            </div>

            <div class="progress-ring-stats">
              <div class="progress-ring-stat">
                <span class="progress-ring-stat__label">执行账户数</span>
                <span class="progress-ring-stat__value">{{ summary.procCnt }}</span>
              </div>
              <div class="progress-ring-stat">
                <span class="progress-ring-stat__label">总账户数</span>
                <span class="progress-ring-stat__value">{{ summary.accountCnt }}</span>
              </div>
              <div class="progress-ring-stat">
                <span class="progress-ring-stat__label">无效影像数</span>
                <span class="progress-ring-stat__value">{{ summary.invalidImageCnt }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="summary-panel summary-panel--plain">
          <div class="summary-panel__eyebrow">机构状态分布</div>
          <div class="summary-panel__title">一眼看清待执行、执行中、执行完毕</div>

          <div class="status-card-list">
            <div
              v-for="item in statusCards"
              :key="item.key"
              class="status-card"
              :class="`status-card--${item.key}`"
            >
              <div class="status-card__title">{{ item.label }}</div>
              <div class="status-card__value">{{ item.value }}</div>
              <div class="status-card__meta">
                占比 {{ formatPercent(item.value, summary.orgCount) }}
              </div>
            </div>
          </div>

          <div class="distribution-block">
            <div class="distribution-block__label">机构执行状态分布图</div>
            <div class="distribution-bar">
              <div
                v-for="item in statusCards"
                :key="item.key"
                class="distribution-bar__segment"
                :class="`distribution-bar__segment--${item.key}`"
                :style="buildDistributionStyle(item.value)"
              >
                <span v-if="item.value" class="distribution-bar__text">
                  {{ item.label }} {{ item.value }}
                </span>
              </div>
            </div>
            <div class="distribution-legend">
              <div
                v-for="item in statusCards"
                :key="item.key"
                class="distribution-legend__item"
              >
                <span
                  class="distribution-legend__dot"
                  :class="`distribution-legend__dot--${item.key}`"
                ></span>
                <span>{{ item.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
    <el-dialog
      title="修改机构印模转换记录"
      :visible.sync="editDialogVisible"
      width="520px"
      @closed="handleEditDialogClosed"
    >
      <el-form
        ref="editForm"
        :model="editForm"
        :rules="editRules"
        label-width="110px"
      >
        <el-form-item label="机构号">
          <el-input v-model="editForm.orgCode" disabled />
        </el-form-item>
        <el-form-item label="执行状态" prop="procStatus">
          <el-select v-model="editForm.procStatus" placeholder="请选择执行状态">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="账户数" prop="accountCnt">
          <el-input-number
            v-model="editForm.accountCnt"
            :min="editForm.procCnt"
            :step="1"
            :precision="0"
            controls-position="right"
            class="account-input"
          />
          <div class="form-tip">
            当前执行账户数为 {{ editForm.procCnt }}，账户数不能小于已执行数量。
          </div>
        </el-form-item>
      </el-form>

      <div slot="footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="editSubmitting" @click="handleSubmitEdit">
          保存
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  deleteOrgSealChangeRecord,
  fetchOrgSealChangeList,
  fetchOrgSealChangeSummary,
  updateOrgSealChangeRecord
} from '@/api/orgSealChange'

function createEmptySummary() {
  return {
    orgCount: 0,
    accountCnt: 0,
    procCnt: 0,
    invalidImageCnt: 0,
    procRate: 0,
    statusSummary: {
      pending: 0,
      running: 0,
      finished: 0
    }
  }
}

function createDefaultEditForm() {
  return {
    orgCode: '',
    procStatus: '0',
    accountCnt: 0,
    procCnt: 0
  }
}

export default {
  name: 'OrgSealChangeView',
  data() {
    return {
      defaultTime: ['00:00:00', '23:59:59'],
      tableLoading: false,
      summaryLoading: false,
      editSubmitting: false,
      editDialogVisible: false,
      queryForm: {
        orgCode: '',
        procStatus: '',
        executeTimeRange: []
      },
      statusOptions: [
        { label: '待执行', value: '0' },
        { label: '执行完毕', value: '1' },
        { label: '执行中', value: '2' }
      ],
      summary: createEmptySummary(),
      tableData: [],
      total: 0,
      pagination: {
        pageNum: 1,
        pageSize: 8
      },
      pageSizes: [8, 10, 20],
      editForm: createDefaultEditForm(),
      editRules: {
        procStatus: [
          { required: true, message: '请选择执行状态', trigger: 'change' }
        ],
        accountCnt: [
          { required: true, message: '请输入账户数', trigger: 'change' },
          {
            validator: (rule, value, callback) => {
              if (value === '' || value === null || value === undefined) {
                callback(new Error('请输入账户数'))
                return
              }

              if (Number(value) < Number(this.editForm.procCnt || 0)) {
                callback(new Error('账户数不能小于当前执行账户数'))
                return
              }

              callback()
            },
            trigger: 'change'
          }
        ]
      }
    }
  },
  computed: {
    statusCards() {
      return [
        {
          key: 'running',
          label: '执行中',
          value: this.summary.statusSummary.running
        },
        {
          key: 'finished',
          label: '执行完毕',
          value: this.summary.statusSummary.finished
        },
        {
          key: 'pending',
          label: '待执行',
          value: this.summary.statusSummary.pending
        }
      ]
    },
    progressPercent() {
      return Number(this.summary.procRate || 0).toFixed(2)
    },
    progressRingStyle() {
      const rate = Math.min(Number(this.summary.procRate || 0), 100)
      return {
        background: `conic-gradient(#1f9d55 0% ${rate}%, rgba(255, 255, 255, 0.18) ${rate}% 100%)`
      }
    }
  },
  created() {
    this.loadPageData()
  },
  methods: {
    buildQueryParams() {
      return {
        orgCode: this.queryForm.orgCode,
        procStatus: this.queryForm.procStatus,
        executeTimeRange: this.queryForm.executeTimeRange
      }
    },
    async loadPageData() {
      await Promise.all([this.loadSummary(), this.loadTable()])
    },
    async loadSummary() {
      this.summaryLoading = true

      try {
        const data = await fetchOrgSealChangeSummary(this.buildQueryParams())
        this.summary = {
          ...createEmptySummary(),
          ...data,
          statusSummary: {
            ...createEmptySummary().statusSummary,
            ...(data.statusSummary || {})
          }
        }
      } catch (error) {
        this.$message.error(error.message || '机构汇总查询失败')
      } finally {
        this.summaryLoading = false
      }
    },
    async loadTable() {
      this.tableLoading = true

      try {
        const data = await fetchOrgSealChangeList({
          ...this.buildQueryParams(),
          ...this.pagination
        })

        this.tableData = data.list || []
        this.total = Number(data.total || 0)
      } catch (error) {
        this.$message.error(error.message || '机构记录查询失败')
      } finally {
        this.tableLoading = false
      }
    },
    handleSearch() {
      this.pagination.pageNum = 1
      this.loadPageData()
    },
    handleReset() {
      this.queryForm = {
        orgCode: '',
        procStatus: '',
        executeTimeRange: []
      }
      this.pagination.pageNum = 1
      this.pagination.pageSize = 8
      this.loadPageData()
    },
    handleRefresh() {
      this.loadPageData()
    },
    handleCurrentChange(pageNum) {
      this.pagination.pageNum = pageNum
      this.loadTable()
    },
    handleSizeChange(pageSize) {
      this.pagination.pageSize = pageSize
      this.pagination.pageNum = 1
      this.loadTable()
    },
    buildDistributionStyle(value) {
      const total = Number(this.summary.orgCount || 0)

      if (!total || !value) {
        return {
          width: '0%'
        }
      }

      return {
        width: `${(Number(value) / total) * 100}%`
      }
    },
    formatPercent(value, total) {
      if (!total) {
        return '0.00%'
      }

      return `${((Number(value || 0) / Number(total)) * 100).toFixed(2)}%`
    },
    statusText(status) {
      const matched = this.statusOptions.find((item) => item.value === status)
      return matched ? matched.label : '未知'
    },
    statusTagType(status) {
      if (status === '1') {
        return 'success'
      }

      if (status === '2') {
        return 'warning'
      }

      return 'info'
    },
    rowProgressPercent(row) {
      if (!Number(row.accountCnt)) {
        return 0
      }

      return Number(
        ((Number(row.procCnt || 0) / Number(row.accountCnt || 0)) * 100).toFixed(2)
      )
    },
    handleOpenEdit(row) {
      this.editForm = {
        orgCode: row.orgCode,
        procStatus: row.procStatus,
        accountCnt: Number(row.accountCnt || 0),
        procCnt: Number(row.procCnt || 0)
      }
      this.editDialogVisible = true
      this.$nextTick(() => {
        if (this.$refs.editForm) {
          this.$refs.editForm.clearValidate()
        }
      })
    },
    handleEditDialogClosed() {
      this.editForm = createDefaultEditForm()
    },
    handleSubmitEdit() {
      this.$refs.editForm.validate(async (valid) => {
        if (!valid) {
          return
        }

        this.editSubmitting = true

        try {
          await updateOrgSealChangeRecord({
            orgCode: this.editForm.orgCode,
            procStatus: this.editForm.procStatus,
            accountCnt: this.editForm.accountCnt
          })

          this.$message.success('机构记录修改成功')
          this.editDialogVisible = false
          await this.loadPageData()
        } catch (error) {
          this.$message.error(error.message || '机构记录修改失败')
        } finally {
          this.editSubmitting = false
        }
      })
    },
    handleDelete(row) {
      this.$confirm(
        `确认删除机构 ${row.orgCode} 的印模转换记录吗？`,
        '删除确认',
        {
          type: 'warning'
        }
      )
        .then(async () => {
          await deleteOrgSealChangeRecord(row.orgCode)

          if (this.tableData.length === 1 && this.pagination.pageNum > 1) {
            this.pagination.pageNum -= 1
          }

          this.$message.success('机构记录删除成功')
          await this.loadPageData()
        })
        .catch((error) => {
          if (error === 'cancel' || error === 'close') {
            return
          }

          this.$message.error(error.message || '机构记录删除失败')
        })
    }
  }
}
</script>

<style scoped>
.org-seal-change-page {
  display: flex;
  flex-direction: column;
}

.org-seal-change-page > .el-card + .el-card {
  margin-top: 16px;
}

.card-header {
  font-weight: 600;
}

.card-header--between {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.query-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.query-form .el-form-item {
  margin-right: 16px;
}

.time-range {
  width: 360px;
}

.summary-card {
  position: relative;
}

.summary-card .el-card__body {
  position: relative;
}

.summary-card .el-card__body::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.summary-layout {
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
  gap: 16px;
}

.summary-panel {
  min-width: 0;
  border-radius: 20px;
  padding: 24px;
}

.summary-panel--accent {
  color: #fff;
  background: linear-gradient(160deg, #0f766e 0%, #155e75 100%);
  box-shadow: 0 16px 36px rgba(15, 118, 110, 0.2);
}

.summary-panel--plain {
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border: 1px solid #e4ebf5;
}

.summary-panel__eyebrow {
  font-size: 12px;
  letter-spacing: 1px;
  opacity: 0.78;
}

.summary-panel__title {
  margin-top: 10px;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.5;
}

.progress-ring-wrap {
  margin-top: 28px;
}

.progress-ring {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 190px;
  height: 190px;
  margin: 0 auto;
  border-radius: 50%;
}

.progress-ring__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 142px;
  height: 142px;
  background: rgba(5, 32, 45, 0.9);
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
}

.progress-ring__percent {
  font-size: 34px;
  font-weight: 700;
  line-height: 1;
}

.progress-ring__meta {
  margin-top: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.72);
}

.progress-ring-stats {
  margin-top: 24px;
}

.progress-ring-stat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 14px;
}

.progress-ring-stat + .progress-ring-stat {
  margin-top: 10px;
}

.progress-ring-stat__label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.76);
}

.progress-ring-stat__value {
  font-size: 20px;
  font-weight: 700;
}

.status-card-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 24px;
}

.status-card {
  position: relative;
  padding: 18px;
  border-radius: 16px;
  overflow: hidden;
}

.status-card::before {
  content: '';
  position: absolute;
  inset: auto 0 0 0;
  height: 4px;
}

.status-card--running {
  background: #fff8eb;
  border: 1px solid #f8deb1;
}

.status-card--running::before {
  background: #e6a23c;
}

.status-card--finished {
  background: #effaf4;
  border: 1px solid #ccebd8;
}

.status-card--finished::before {
  background: #67c23a;
}

.status-card--pending {
  background: #f4f7fb;
  border: 1px solid #dde5f0;
}

.status-card--pending::before {
  background: #909399;
}

.status-card__title {
  font-size: 14px;
  color: #606266;
}

.status-card__value {
  margin-top: 12px;
  font-size: 34px;
  font-weight: 700;
  color: #1f2d3d;
  line-height: 1;
}

.status-card__meta {
  margin-top: 10px;
  font-size: 13px;
  color: #909399;
}

.distribution-block {
  margin-top: 22px;
  padding: 18px;
  background: #f7fafd;
  border: 1px solid #e5edf7;
  border-radius: 16px;
}

.distribution-block__label {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.distribution-bar {
  display: flex;
  height: 52px;
  margin-top: 16px;
  overflow: hidden;
  background: #edf2f8;
  border-radius: 999px;
}

.distribution-bar__segment {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  transition: width 0.3s ease;
}

.distribution-bar__segment--running {
  background: linear-gradient(90deg, #f7c56a 0%, #e6a23c 100%);
}

.distribution-bar__segment--finished {
  background: linear-gradient(90deg, #9add81 0%, #67c23a 100%);
}

.distribution-bar__segment--pending {
  background: linear-gradient(90deg, #cbd5e1 0%, #909399 100%);
}

.distribution-bar__text {
  padding: 0 10px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
}

.distribution-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 14px;
}

.distribution-legend__item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #606266;
}

.distribution-legend__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.distribution-legend__dot--running {
  background: #e6a23c;
}

.distribution-legend__dot--finished {
  background: #67c23a;
}

.distribution-legend__dot--pending {
  background: #909399;
}

.table-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.table-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-progress .el-progress {
  flex: 1 1 auto;
}

.table-progress__text {
  flex: 0 0 auto;
  font-size: 12px;
  color: #606266;
}

.danger-text {
  color: #f56c6c;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.account-input {
  width: 100%;
}

.form-tip {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.6;
  color: #909399;
}

@media (max-width: 1200px) {
  .summary-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .card-header--between {
    align-items: flex-start;
    flex-direction: column;
  }

  .time-range {
    width: 100%;
  }

  .status-card-list {
    grid-template-columns: 1fr;
  }

  .table-header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .table-progress {
    display: block;
  }

  .table-progress__text {
    display: block;
    margin-top: 8px;
  }

  .pagination-wrapper {
    justify-content: center;
  }
}
</style>
