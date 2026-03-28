<template>
  <div class="page seal-page">
    <el-card shadow="never" class="filter-card">
      <div slot="header" class="card-header">
        <span>查询条件</span>
      </div>

      <el-form :inline="true" :model="queryForm" class="filter-form">
        <el-form-item label="起止时间" required>
          <el-date-picker
            v-model="queryForm.timeRange"
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
          <el-button type="primary" @click="handleQuerySummary">
            查询统计
          </el-button>
          <el-button type="success" @click="handleQueryDetails(true)">
            查询明细
          </el-button>
          <el-button @click="handleQueryAll">全部查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-alert
        title="时间格式统一为 yyyy-MM-dd HH:mm:ss；当前为前端模拟数据，已预留真实接口调用逻辑。"
        type="info"
        :closable="false"
        show-icon
      />
    </el-card>

    <el-card shadow="never" class="section-card">
      <div slot="header" class="card-header card-header--between">
        <span>统计结果</span>
        <el-tag type="info">差异总数 = G01通过Win不通过 + Win通过G01不通过</el-tag>
      </div>

      <div class="summary-layout">
        <div class="summary-total-card">
          <div class="summary-total-card__eyebrow">统计概览</div>
          <div class="summary-total-card__label">样本总量与差异情况</div>

          <div class="summary-total-card__stats">
            <div class="summary-total-stat">
              <div class="summary-total-stat__label">{{ totalSummaryCard.label }}</div>
              <div class="summary-total-stat__value">
                {{ summary[totalSummaryCard.key] }}
              </div>
              <div class="summary-total-stat__meta">作为全部指标占比计算基准</div>
            </div>

            <div class="summary-total-card__divider"></div>

            <div class="summary-total-stat summary-total-stat--diff">
              <div class="summary-total-stat__label">{{ diffSummaryCard.label }}</div>
              <div class="summary-total-stat__value">
                {{ summary[diffSummaryCard.key] }}
              </div>
              <div class="summary-total-stat__meta">
                占比 {{ formatRate(summary[diffSummaryCard.key]) }}
              </div>
              <div class="summary-total-stat__track">
                <div
                  class="summary-total-stat__bar"
                  :style="rateStyle(summary[diffSummaryCard.key])"
                ></div>
              </div>
            </div>
          </div>

          <div class="summary-total-card__hint">
            差异总数 = G01通过 Win不通过 + Win通过 G01不通过，用于快速判断两套算法的结果偏差。
          </div>
        </div>

        <div class="summary-metrics-grid">
          <div
            v-for="item in metricSummaryCards"
            :key="item.key"
            class="summary-metric-card"
          >
            <div class="summary-metric-card__header">
              <div class="summary-metric-card__label">{{ item.label }}</div>
              <div class="summary-metric-card__rate">
                {{ formatRate(summary[item.key]) }}
              </div>
            </div>

            <div class="summary-metric-card__value">{{ summary[item.key] }}</div>

            <div class="summary-metric-card__track">
              <div
                class="summary-metric-card__bar"
                :style="rateStyle(summary[item.key])"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div v-loading="summaryLoading" class="loading-mask"></div>
    </el-card>

    <el-card shadow="never" class="section-card">
      <div slot="header" class="card-header card-header--between">
        <span>明细数据</span>
        <el-tag type="info">共 {{ detailTotal }} 条</el-tag>
      </div>

      <el-table
        v-loading="detailLoading"
        :data="detailList"
        border
        stripe
        style="width: 100%;"
      >
        <el-table-column prop="bizNo" label="业务流水号" min-width="150" />
        <el-table-column prop="accountName" label="账户名称" min-width="120" />
        <el-table-column prop="verifyTime" label="验印时间" min-width="180" />
        <el-table-column prop="amount" label="金额" min-width="100" />
        <el-table-column label="G01结果" min-width="110">
          <template slot-scope="{ row }">
            <el-tag :type="row.g01Result === '通过' ? 'success' : 'danger'">
              {{ row.g01Result }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Win结果" min-width="110">
          <template slot-scope="{ row }">
            <el-tag :type="row.winResult === '通过' ? 'success' : 'danger'">
              {{ row.winResult }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="差异类型" min-width="180">
          <template slot-scope="{ row }">
            <el-tag :type="diffTagType(row.diffType)">
              {{ row.diffType }}
            </el-tag>
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
          :total="detailTotal"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
function pad(value) {
  return String(value).padStart(2, '0')
}

function formatDateTime(date) {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join('-') + ' ' + [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  ].join(':')
}

function createDefaultTimeRange() {
  const end = new Date()
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000)

  return [formatDateTime(start), formatDateTime(end)]
}

function createEmptySummary() {
  return {
    total: 0,
    g01Paas: 0,
    winPaas: 0,
    g01PaasWinNotPaas: 0,
    winPaasG01NotPaas: 0,
    totalDiff: 0
  }
}

const USE_MOCK = true

const MOCK_SUMMARY = {
  total: 128,
  g01Paas: 101,
  winPaas: 97,
  g01PaasWinNotPaas: 14,
  winPaasG01NotPaas: 10,
  totalDiff: 24
}

function createMockDetailList(total) {
  return Array.from({ length: total }, function (_, index) {
    const id = index + 1
    const verifyDate = new Date(2026, 2, 1, 8, 0, 0)
    verifyDate.setMinutes(verifyDate.getMinutes() + index * 17)

    const g01Passed = id % 4 !== 0
    const winPassed = id % 5 !== 0
    let diffType = '一致'

    if (g01Passed && !winPassed) {
      diffType = 'G01通过 Win不通过'
    } else if (!g01Passed && winPassed) {
      diffType = 'Win通过 G01不通过'
    }

    return {
      id: id,
      bizNo: `YYSF${String(100000 + id)}`,
      accountName: `测试客户${id}`,
      verifyTime: formatDateTime(verifyDate),
      g01Result: g01Passed ? '通过' : '不通过',
      winResult: winPassed ? '通过' : '不通过',
      diffType: diffType,
      amount: (1000 + id * 23.5).toFixed(2)
    }
  })
}

const MOCK_DETAIL_LIST = createMockDetailList(MOCK_SUMMARY.total)

function mockRequest(data) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(data)
    }, 300)
  })
}

async function fetchSealVerifySummary(params) {
  if (USE_MOCK) {
    return mockRequest({
      total: MOCK_SUMMARY.total,
      g01Paas: MOCK_SUMMARY.g01Paas,
      winPaas: MOCK_SUMMARY.winPaas,
      g01PaasWinNotPaas: MOCK_SUMMARY.g01PaasWinNotPaas,
      winPaasG01NotPaas: MOCK_SUMMARY.winPaasG01NotPaas,
      totalDiff: MOCK_SUMMARY.totalDiff,
      requestParams: params
    })
  }

  // 接入真实接口时，可在此处替换为 axios 或项目统一 request 方法。
  throw new Error('请先接入统计接口。')
}

async function fetchSealVerifyDetails(params) {
  if (USE_MOCK) {
    const pageNum = params.pageNum || 1
    const pageSize = params.pageSize || 10
    const start = (pageNum - 1) * pageSize
    const end = start + pageSize

    return mockRequest({
      total: MOCK_DETAIL_LIST.length,
      list: MOCK_DETAIL_LIST.slice(start, end),
      requestParams: params
    })
  }

  // 接入真实接口时，可在此处替换为 axios 或项目统一 request 方法。
  throw new Error('请先接入明细接口。')
}

export default {
  name: 'SealAlgorithmVerifyView',
  data() {
    return {
      defaultTime: ['00:00:00', '23:59:59'],
      queryForm: {
        timeRange: createDefaultTimeRange()
      },
      summaryLoading: false,
      detailLoading: false,
      summary: createEmptySummary(),
      detailList: [],
      detailTotal: 0,
      pagination: {
        pageNum: 1,
        pageSize: 10
      },
      pageSizes: [10, 20, 50],
      summaryCards: [
        { key: 'total', label: '总数' },
        { key: 'g01Paas', label: 'G01自动验印通过数' },
        { key: 'winPaas', label: 'Win自动通过数' },
        { key: 'g01PaasWinNotPaas', label: 'G01通过 Win不通过' },
        { key: 'winPaasG01NotPaas', label: 'Win通过 G01不通过' },
        { key: 'totalDiff', label: '差异总数' }
      ]
    }
  },
  computed: {
    totalSummaryCard() {
      return this.summaryCards.find((item) => item.key === 'total')
    },
    diffSummaryCard() {
      return this.summaryCards.find((item) => item.key === 'totalDiff')
    },
    metricSummaryCards() {
      return this.summaryCards.filter(
        (item) => item.key !== 'total' && item.key !== 'totalDiff'
      )
    }
  },
  created() {
    this.handleQueryAll()
  },
  methods: {
    buildQueryParams() {
      const [startTime, endTime] = this.queryForm.timeRange || []

      return {
        startTime,
        endTime
      }
    },
    validateTimeRange() {
      if (!this.queryForm.timeRange || this.queryForm.timeRange.length !== 2) {
        this.$message.warning('请选择完整的起止时间。')
        return false
      }

      return true
    },
    async handleQuerySummary() {
      if (!this.validateTimeRange()) {
        return
      }

      this.summaryLoading = true

      try {
        const data = await fetchSealVerifySummary(this.buildQueryParams())
        this.summary = {
          ...createEmptySummary(),
          ...data
        }
      } catch (error) {
        this.$message.error(error.message || '统计数据查询失败。')
      } finally {
        this.summaryLoading = false
      }
    },
    async handleQueryDetails(resetPage = false) {
      if (!this.validateTimeRange()) {
        return
      }

      if (resetPage) {
        this.pagination.pageNum = 1
      }

      this.detailLoading = true

      try {
        const data = await fetchSealVerifyDetails({
          ...this.buildQueryParams(),
          ...this.pagination
        })

        this.detailList = data.list || []
        this.detailTotal = data.total || 0
      } catch (error) {
        this.$message.error(error.message || '明细数据查询失败。')
      } finally {
        this.detailLoading = false
      }
    },
    handleQueryAll() {
      this.handleQuerySummary()
      this.handleQueryDetails(true)
    },
    handleReset() {
      this.queryForm.timeRange = createDefaultTimeRange()
      this.pagination.pageNum = 1
      this.pagination.pageSize = 10
      this.handleQueryAll()
    },
    handleCurrentChange(pageNum) {
      this.pagination.pageNum = pageNum
      this.handleQueryDetails()
    },
    handleSizeChange(pageSize) {
      this.pagination.pageSize = pageSize
      this.handleQueryDetails(true)
    },
    formatRateValue(value) {
      if (!this.summary.total) {
        return 0
      }

      return (Number(value || 0) / this.summary.total) * 100
    },
    formatRate(value) {
      return `${this.formatRateValue(value).toFixed(2)}%`
    },
    rateStyle(value) {
      const rate = Math.min(this.formatRateValue(value), 100)
      return {
        width: `${rate}%`
      }
    },
    diffTagType(diffType) {
      if (diffType === '一致') {
        return 'success'
      }

      if (diffType === 'G01通过 Win不通过') {
        return 'warning'
      }

      return 'danger'
    }
  }
}
</script>

<style scoped>
.seal-page {
  display: flex;
  flex-direction: column;
}

.seal-page > .el-card + .el-card {
  margin-top: 16px;
}

.filter-card,
.section-card {
  position: relative;
}

.card-header {
  font-weight: 600;
}

.card-header--between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.filter-form .el-form-item {
  margin-right: 16px;
}

.time-range {
  width: 420px;
}

.summary-layout {
  display: flex;
  align-items: stretch;
  margin-bottom: 20px;
  margin-left: -8px;
  margin-right: -8px;
}

.summary-total-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 284px;
  margin: 0 8px;
  min-height: 220px;
  padding: 24px;
  color: #fff;
  background: linear-gradient(145deg, #1f6feb 0%, #0f4fc9 100%);
  border-radius: 18px;
  box-shadow: 0 14px 30px rgba(31, 111, 235, 0.18);
  overflow: hidden;
}

.summary-total-card::before,
.summary-total-card::after {
  content: '';
  position: absolute;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.summary-total-card::before {
  top: -48px;
  right: -28px;
  width: 148px;
  height: 148px;
}

.summary-total-card::after {
  right: 80px;
  bottom: -54px;
  width: 132px;
  height: 132px;
}

.summary-total-card__eyebrow {
  position: relative;
  z-index: 1;
  font-size: 12px;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.72);
}

.summary-total-card__label {
  position: relative;
  z-index: 1;
  margin-top: 10px;
  font-size: 16px;
  font-weight: 600;
}

.summary-total-card__stats {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  margin-top: 22px;
}

.summary-total-card__divider {
  flex: 0 0 auto;
  width: 1px;
  height: 72px;
  margin: 0 18px;
  background: rgba(255, 255, 255, 0.2);
}

.summary-total-stat {
  flex: 1 1 0;
  min-width: 0;
  padding: 16px 18px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}

.summary-total-stat--diff {
  background: linear-gradient(180deg, rgba(255, 206, 147, 0.2) 0%, rgba(255, 159, 67, 0.16) 100%);
  border-color: rgba(255, 220, 170, 0.32);
}

.summary-total-stat__label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.74);
}

.summary-total-stat__value {
  margin-top: 12px;
  font-size: 42px;
  font-weight: 700;
  line-height: 1;
}

.summary-total-stat__meta {
  margin-top: 10px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.82);
}

.summary-total-stat__track {
  height: 6px;
  margin-top: 14px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 999px;
}

.summary-total-stat__bar {
  height: 100%;
  min-width: 6px;
  background: linear-gradient(90deg, #ffd391 0%, #ff9f43 100%);
  border-radius: 999px;
}

.summary-total-card__hint {
  position: relative;
  z-index: 1;
  margin-top: 18px;
  font-size: 13px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.78);
}

.summary-metrics-grid {
  flex: 1 1 auto;
  min-width: 0;
  margin: 0 8px;
  font-size: 0;
}

.summary-metric-card {
  display: inline-block;
  position: relative;
  width: calc(50% - 16px);
  margin: 0 8px 16px;
  vertical-align: top;
  min-height: 102px;
  padding: 18px 20px;
  box-sizing: border-box;
  background: #fbfcff;
  border: 1px solid #e7eef8;
  border-radius: 16px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
  overflow: hidden;
}

.summary-metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #d8e4f5 0%, #bfd3ee 100%);
}

.summary-metric-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.summary-metric-card__label {
  min-width: 0;
  padding-right: 12px;
  font-size: 13px;
  line-height: 1.6;
  color: #606266;
}

.summary-metric-card__rate {
  flex-shrink: 0;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #516277;
  background: #eef3f8;
  border-radius: 999px;
}

.summary-metric-card__value {
  margin-top: 14px;
  font-size: 28px;
  font-weight: 700;
  color: #1f2d3d;
}

.summary-metric-card__track {
  height: 6px;
  margin-top: 16px;
  overflow: hidden;
  background: #e6edf5;
  border-radius: 999px;
}

.summary-metric-card__bar {
  height: 100%;
  min-width: 6px;
  background: linear-gradient(90deg, #b9cce5 0%, #8faed4 100%);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.loading-mask {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  pointer-events: none;
}

@media (max-width: 768px) {
  .time-range {
    width: 100%;
  }

  .summary-layout {
    display: block;
    margin-left: 0;
    margin-right: 0;
  }

  .summary-total-card {
    width: auto;
    margin: 0;
    min-height: auto;
  }

  .summary-total-card__stats {
    display: block;
  }

  .summary-total-card__divider {
    display: none;
  }

  .summary-total-stat + .summary-total-stat {
    margin-top: 12px;
  }

  .summary-metrics-grid {
    margin: 16px 0 0;
  }

  .card-header--between {
    align-items: flex-start;
    flex-direction: column;
  }

  .card-header--between .el-tag {
    margin-top: 8px;
  }

  .summary-metric-card {
    display: block;
    width: auto;
    margin: 0 0 16px;
  }

  .summary-metric-card:last-child {
    margin-bottom: 0;
  }

  .pagination-wrapper {
    justify-content: center;
  }
}
</style>
