<template>
  <div class="page generate-task-page">
    <el-card shadow="never" class="section-card">
      <div slot="header" class="card-header card-header--between">
        <div class="section-title">
          <div class="section-title__main">生成条件</div>
          <div class="section-title__sub">
            统一维护起止时间，并按任务场景动态切换附加条件。
          </div>
        </div>
        <el-tag type="info">{{ activeScenario.shortLabel }}</el-tag>
      </div>

      <div class="scenario-grid">
        <div
          v-for="item in taskScenarios"
          :key="item.value"
          :class="['scenario-card', { 'scenario-card--active': form.taskType === item.value }]"
          @click="handleScenarioChange(item.value)"
        >
          <div class="scenario-card__header">
            <div class="scenario-card__title">{{ item.label }}</div>
            <el-tag size="mini" :type="form.taskType === item.value ? 'primary' : 'info'">
              {{ item.shortLabel }}
            </el-tag>
          </div>
          <div class="scenario-card__desc">{{ item.description }}</div>
          <div class="scenario-card__tags">
            <span
              v-for="tag in item.conditionTags"
              :key="tag"
              class="scenario-card__tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>

      <el-form :model="form" label-width="96px" class="generate-form">
        <el-row :gutter="20">
          <el-col :xs="24" :md="12">
            <el-form-item label="起止时间" required>
              <el-date-picker
                v-model="form.timeRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="yyyy-MM-dd HH:mm:ss"
                format="yyyy-MM-dd HH:mm:ss"
                :default-time="defaultTime"
                class="form-control"
              />
            </el-form-item>
          </el-col>

          <el-col
            v-if="activeScenario.value === 'inconsistent-result' || activeScenario.value === 'plat1-task'"
            :xs="24"
            :md="6"
          >
            <el-form-item label="厂商类型" required>
              <el-select
                v-model="form.vendorType"
                placeholder="请选择厂商类型"
                class="form-control"
              >
                <el-option
                  v-for="item in vendorOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col v-if="activeScenario.value === 'user-auto-task'" :xs="24" :md="6">
            <el-form-item label="用户号" required>
              <el-input
                v-model.trim="form.userNo"
                placeholder="请输入用户号"
                class="form-control"
                maxlength="32"
              />
            </el-form-item>
          </el-col>

          <el-col v-if="activeScenario.value === 'plat1-task'" :xs="24" :md="6">
            <el-form-item label="核验环境" required>
              <el-select
                v-model="form.verifyEnv"
                placeholder="请选择核验环境"
                class="form-control"
              >
                <el-option
                  v-for="item in envOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <div class="form-actions">
          <el-button type="success" @click="handleGenerate">
            生成验证任务
          </el-button>
          <el-button @click="handleReset">
            重置条件
          </el-button>
        </div>
      </el-form>

      <div class="condition-footer">
        <div class="condition-footer__title">当前场景说明</div>
        <div class="condition-footer__desc">{{ activeScenario.helperText }}</div>
      </div>
    </el-card>

    <div class="content-grid">
      <el-card shadow="never" class="section-card section-card--soft">
        <div slot="header" class="card-header">
          <span>条件摘要</span>
        </div>

        <div class="summary-panel">
          <div class="summary-panel__title">{{ activeScenario.label }}</div>
          <div class="summary-panel__desc">{{ activeScenario.description }}</div>

          <div class="summary-panel__group">
            <div class="summary-panel__group-title">已选条件</div>
            <div class="summary-panel__tags">
              <span
                v-for="tag in currentConditionTags"
                :key="tag"
                class="summary-panel__tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <div class="summary-panel__group">
            <div class="summary-panel__group-title">执行结果</div>
            <div class="summary-result" v-if="lastGeneratedInfo">
              <div class="summary-result__status">最近一次操作已完成</div>
              <div class="summary-result__text">{{ lastGeneratedInfo }}</div>
            </div>
            <div v-else class="summary-panel__empty">
              当前尚未生成任务，填写条件后点击“生成验证任务”。
            </div>
          </div>
        </div>
      </el-card>

      <el-card shadow="never" class="section-card rule-card">
        <div slot="header" class="card-header">
          <span>当前规则说明</span>
        </div>

        <div class="rule-panel">
          <div class="rule-panel__title">{{ activeScenario.label }}</div>
          <div class="rule-panel__desc">{{ activeScenario.description }}</div>

          <div class="rule-panel__block">
            <div class="rule-panel__block-title">已选条件</div>
            <div class="rule-panel__tags">
              <span
                v-for="tag in currentConditionTags"
                :key="tag"
                class="rule-panel__tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <div class="rule-panel__block">
            <div class="rule-panel__block-title">生成逻辑</div>
            <div
              v-for="line in activeScenario.ruleLines"
              :key="line"
              class="rule-panel__line"
            >
              {{ line }}
            </div>
          </div>

          <div class="rule-panel__notice">
            当前为前端模拟生成。后续接入真实接口时，可将 `handleGenerate`
            中的 mock 逻辑替换为后端提交接口。
          </div>
        </div>
      </el-card>
    </div>
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
  const start = new Date(end.getTime() - 3 * 24 * 60 * 60 * 1000)

  return [formatDateTime(start), formatDateTime(end)]
}

function createDefaultForm() {
  return {
    taskType: 'inconsistent-result',
    timeRange: createDefaultTimeRange(),
    vendorType: 'core',
    userNo: '',
    verifyEnv: 'prod'
  }
}

const TASK_SCENARIOS = [
  {
    value: 'inconsistent-result',
    label: '核验结果不一致记录重新核验',
    shortLabel: '不一致复核',
    description: '筛选指定时间段内某个厂商的核验结果不一致记录，生成重新核验任务。',
    helperText: '当前场景要求：起止时间 + 厂商类型，用于重新生成核验结果不一致的复核任务。',
    conditionTags: ['起止时间', '厂商类型'],
    ruleLines: [
      '只提取核验结果不一致的验印记录。',
      '按厂商维度拆分批次，便于后续定向复核。',
      '默认将不一致任务标记为高优先级。'
    ]
  },
  {
    value: 'user-auto-task',
    label: '某用户核验账号对应自动验印任务复核',
    shortLabel: '用户复核',
    description: '筛选指定时间段内某个用户的核验记录，生成该用户关联账号的自动验印复核任务。',
    helperText: '当前场景要求：起止时间 + 用户号，用于追踪某个用户处理过的账号自动验印任务。',
    conditionTags: ['起止时间', '用户号'],
    ruleLines: [
      '以用户号定位核验记录，再回溯对应账号的自动验印任务。',
      '同一用户下按账号组装任务，便于人工集中复核。',
      '适合排查特定操作员处理结果。'
    ]
  },
  {
    value: 'plat1-task',
    label: '时间段内 PLAT1 任务复核',
    shortLabel: 'PLAT1复核',
    description: '筛选指定时间段内某厂商、某核验环境下的验印记录，生成 PLAT1 平台复核任务。',
    helperText: '当前场景要求：起止时间 + 厂商类型 + 核验环境，平台固定为 PLAT1。',
    conditionTags: ['起止时间', '厂商类型', '核验环境'],
    ruleLines: [
      '仅生成指定厂商、指定环境下的 PLAT1 任务。',
      '任务按环境和厂商组合拆分，避免不同环境数据混杂。',
      '适合按平台和环境集中回归验证。'
    ]
  }
]

const VENDOR_OPTIONS = [
  { label: '核心厂商', value: 'core' },
  { label: '华章厂商', value: 'huazhang' },
  { label: '银丰厂商', value: 'yinfeng' },
  { label: '联测厂商', value: 'liance' }
]

const ENV_OPTIONS = [
  { label: '生产环境', value: 'prod' },
  { label: '预发环境', value: 'pre' },
  { label: '测试环境', value: 'test' }
]

let taskSeed = 1
let batchSeed = 1

function buildSerial(prefix, seed) {
  const now = new Date()
  const datePart = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate())
  ].join('')

  return `${prefix}${datePart}${String(seed).padStart(4, '0')}`
}

function nextTaskNo() {
  const taskNo = buildSerial('VT', taskSeed)
  taskSeed += 1
  return taskNo
}

function nextBatchNo() {
  const batchNo = buildSerial('VB', batchSeed)
  batchSeed += 1
  return batchNo
}

function labelOf(options, value) {
  const matched = options.find((item) => item.value === value)
  return matched ? matched.label : value
}

function buildConditionText(payload) {
  const segments = [
    `${payload.startTime} 至 ${payload.endTime}`
  ]

  if (payload.vendorType) {
    segments.push(`厂商类型=${payload.vendorTypeLabel}`)
  }

  if (payload.userNo) {
    segments.push(`用户号=${payload.userNo}`)
  }

  if (payload.verifyEnv) {
    segments.push(`核验环境=${payload.verifyEnvLabel}`)
  }

  if (payload.platform) {
    segments.push(`平台=${payload.platform}`)
  }

  return segments.join('；')
}

function createPreviewList(payload) {
  const scenarioFactories = {
    'inconsistent-result': function () {
      return [
        {
          suffix: '高优先批次',
          priority: '高',
          accountCount: 14,
          recordCount: 38
        },
        {
          suffix: '标准批次A',
          priority: '中',
          accountCount: 11,
          recordCount: 24
        },
        {
          suffix: '标准批次B',
          priority: '中',
          accountCount: 8,
          recordCount: 17
        }
      ]
    },
    'user-auto-task': function () {
      const userFactor = payload.userNo.length % 3
      return [
        {
          suffix: '账号聚合1',
          priority: '中',
          accountCount: 9 + userFactor,
          recordCount: 21 + userFactor * 3
        },
        {
          suffix: '账号聚合2',
          priority: '低',
          accountCount: 6 + userFactor,
          recordCount: 14 + userFactor * 2
        }
      ]
    },
    'plat1-task': function () {
      return [
        {
          suffix: `${payload.verifyEnvLabel}批次1`,
          priority: '高',
          accountCount: 16,
          recordCount: 42
        },
        {
          suffix: `${payload.verifyEnvLabel}批次2`,
          priority: '中',
          accountCount: 12,
          recordCount: 29
        },
        {
          suffix: `${payload.verifyEnvLabel}批次3`,
          priority: '中',
          accountCount: 10,
          recordCount: 18
        }
      ]
    }
  }

  const factory = scenarioFactories[payload.taskType]
  const baseList = factory ? factory() : []

  return baseList.map(function (item) {
    return {
      taskNo: nextTaskNo(),
      taskName: `${payload.taskTypeLabel}-${item.suffix}`,
      sourceScope: buildConditionText(payload),
      accountCount: item.accountCount,
      recordCount: item.recordCount,
      priority: item.priority,
      status: '待生成'
    }
  })
}

function summarizeRecords(list) {
  return list.reduce(function (sum, item) {
    return sum + Number(item.recordCount || 0)
  }, 0)
}

function summarizeAccounts(list) {
  return list.reduce(function (sum, item) {
    return sum + Number(item.accountCount || 0)
  }, 0)
}

function createInitialBatch(payload) {
  const generatedList = createPreviewList(payload)

  return {
    batchNo: nextBatchNo(),
    taskTypeLabel: payload.taskTypeLabel,
    conditionText: buildConditionText(payload),
    taskCount: generatedList.length,
    recordCount: summarizeRecords(generatedList),
    createdBy: '演示用户',
    createdTime: formatDateTime(new Date()),
    status: '已生成'
  }
}

export default {
  name: 'GenerateVerifyTaskView',
  data() {
    return {
      defaultTime: ['00:00:00', '23:59:59'],
      taskScenarios: TASK_SCENARIOS,
      vendorOptions: VENDOR_OPTIONS,
      envOptions: ENV_OPTIONS,
      form: createDefaultForm(),
      lastGeneratedBatch: null
    }
  },
  computed: {
    activeScenario() {
      return this.taskScenarios.find((item) => item.value === this.form.taskType) || this.taskScenarios[0]
    },
    currentConditionTags() {
      const [startTime, endTime] = this.form.timeRange || []
      const tags = []

      if (startTime && endTime) {
        tags.push(`时间范围：${startTime} 至 ${endTime}`)
      }

      if (this.activeScenario.value === 'inconsistent-result' || this.activeScenario.value === 'plat1-task') {
        tags.push(`厂商类型：${labelOf(this.vendorOptions, this.form.vendorType)}`)
      }

      if (this.activeScenario.value === 'user-auto-task') {
        tags.push(`用户号：${this.form.userNo || '未填写'}`)
      }

      if (this.activeScenario.value === 'plat1-task') {
        tags.push(`核验环境：${labelOf(this.envOptions, this.form.verifyEnv)}`)
        tags.push('平台：PLAT1')
      }

      return tags
    },
    lastGeneratedInfo() {
      if (!this.lastGeneratedBatch) {
        return ''
      }

      return [
        `批次号：${this.lastGeneratedBatch.batchNo}`,
        `任务场景：${this.lastGeneratedBatch.taskTypeLabel}`,
        `生成条件：${this.lastGeneratedBatch.conditionText}`,
        `任务数：${this.lastGeneratedBatch.taskCount}`,
        `记录数：${this.lastGeneratedBatch.recordCount}`,
        `生成时间：${this.lastGeneratedBatch.createdTime}`
      ].join('；')
    }
  },
  created() {
    this.lastGeneratedBatch = createInitialBatch({
      taskType: 'plat1-task',
      taskTypeLabel: '时间段内 PLAT1 任务复核',
      startTime: '2026-03-22 00:00:00',
      endTime: '2026-03-23 23:59:59',
      vendorType: 'core',
      vendorTypeLabel: labelOf(this.vendorOptions, 'core'),
      verifyEnv: 'pre',
      verifyEnvLabel: labelOf(this.envOptions, 'pre'),
      platform: 'PLAT1'
    })
  },
  methods: {
    buildPayload() {
      const timeRange = this.form.timeRange || []

      return {
        taskType: this.activeScenario.value,
        taskTypeLabel: this.activeScenario.label,
        startTime: timeRange[0],
        endTime: timeRange[1],
        vendorType: this.form.vendorType,
        vendorTypeLabel: labelOf(this.vendorOptions, this.form.vendorType),
        userNo: this.form.userNo,
        verifyEnv: this.form.verifyEnv,
        verifyEnvLabel: labelOf(this.envOptions, this.form.verifyEnv),
        platform: this.activeScenario.value === 'plat1-task' ? 'PLAT1' : ''
      }
    },
    validateForm() {
      if (!this.form.timeRange || this.form.timeRange.length !== 2) {
        this.$message.warning('请选择完整的起止时间。')
        return false
      }

      if ((this.activeScenario.value === 'inconsistent-result' || this.activeScenario.value === 'plat1-task') && !this.form.vendorType) {
        this.$message.warning('请选择厂商类型。')
        return false
      }

      if (this.activeScenario.value === 'user-auto-task' && !this.form.userNo) {
        this.$message.warning('请输入用户号。')
        return false
      }

      if (this.activeScenario.value === 'plat1-task' && !this.form.verifyEnv) {
        this.$message.warning('请选择核验环境。')
        return false
      }

      return true
    },
    applyScenarioDefaults(taskType) {
      this.form.taskType = taskType
      this.form.vendorType = taskType === 'user-auto-task' ? '' : 'core'
      this.form.userNo = ''
      this.form.verifyEnv = taskType === 'plat1-task' ? 'prod' : ''
    },
    handleScenarioChange(taskType) {
      if (this.form.taskType === taskType) {
        return
      }

      const currentTimeRange = this.form.timeRange
      this.applyScenarioDefaults(taskType)
      this.form.timeRange = currentTimeRange
    },
    handleGenerate() {
      if (!this.validateForm()) {
        return
      }

      const payload = this.buildPayload()
      const previewList = createPreviewList(payload)
      const batch = {
        batchNo: nextBatchNo(),
        taskTypeLabel: payload.taskTypeLabel,
        conditionText: buildConditionText(payload),
        taskCount: previewList.length,
        recordCount: summarizeRecords(previewList),
        createdBy: '演示用户',
        createdTime: formatDateTime(new Date()),
        status: '已生成'
      }

      this.lastGeneratedBatch = batch
      this.$message.success(`已生成 ${batch.taskCount} 条验证任务。`)
    },
    handleReset() {
      this.form = createDefaultForm()
    }
  }
}
</script>

<style scoped>
.generate-task-page {
  display: flex;
  flex-direction: column;
}

.generate-task-page > * + * {
  margin-top: 16px;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(320px, 1.05fr) minmax(320px, 0.95fr);
  gap: 16px;
}

.section-card {
  border-radius: 18px;
  border: 1px solid #e8edf3;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
}

.card-header {
  font-weight: 600;
}

.card-header--between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  display: flex;
  flex-direction: column;
}

.section-title__main {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.section-title__sub {
  margin-top: 6px;
  font-size: 13px;
  font-weight: 400;
  color: #7b8794;
}

.scenario-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.scenario-card {
  position: relative;
  padding: 18px 18px 16px;
  cursor: pointer;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border: 1px solid #e3ebf4;
  border-radius: 16px;
  transition: all 0.2s ease;
}

.scenario-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #d7e3f4 0%, #bdd3ef 100%);
  border-radius: 16px 16px 0 0;
}

.scenario-card:hover {
  border-color: #8ab4f8;
  box-shadow: 0 14px 30px rgba(64, 158, 255, 0.12);
  transform: translateY(-2px);
}

.scenario-card--active {
  background: linear-gradient(180deg, #eef6ff 0%, #f8fbff 100%);
  border-color: #409eff;
  box-shadow: 0 16px 34px rgba(64, 158, 255, 0.16);
}

.scenario-card--active::before {
  background: linear-gradient(90deg, #409eff 0%, #67c23a 100%);
}

.scenario-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.scenario-card__title {
  min-width: 0;
  padding-right: 10px;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.6;
  color: #303133;
}

.scenario-card__desc {
  margin-top: 10px;
  min-height: 66px;
  line-height: 1.8;
  color: #606266;
}

.scenario-card__tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 14px;
}

.scenario-card__tag {
  margin: 0 8px 8px 0;
  padding: 4px 10px;
  font-size: 12px;
  color: #476582;
  background: #edf3f9;
  border-radius: 999px;
}

.generate-form {
  padding: 22px 22px 4px;
  margin-bottom: 18px;
  background: linear-gradient(180deg, #fbfdff 0%, #f7faff 100%);
  border: 1px solid #edf2f7;
  border-radius: 18px;
}

.form-control {
  width: 100%;
}

.form-actions {
  display: flex;
  padding-left: 96px;
}

.form-actions .el-button + .el-button {
  margin-left: 12px;
}

.condition-footer {
  padding: 16px 18px;
  background: linear-gradient(180deg, #f8fbff 0%, #f2f7fd 100%);
  border: 1px solid #e5eef8;
  border-radius: 16px;
}

.condition-footer__title {
  font-size: 13px;
  font-weight: 700;
  color: #38506a;
}

.condition-footer__desc {
  margin-top: 8px;
  line-height: 1.8;
  color: #5f6b7a;
}

.section-card--soft {
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
}

.summary-panel {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.summary-panel__title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
}

.summary-panel__desc {
  margin-top: 10px;
  line-height: 1.8;
  color: #5b6472;
}

.summary-panel__group {
  margin-top: 22px;
}

.summary-panel__group-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.summary-panel__tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 12px;
}

.summary-panel__tag {
  margin: 0 8px 8px 0;
  padding: 7px 12px;
  font-size: 12px;
  color: #3d5f84;
  background: #eef4fb;
  border-radius: 999px;
}

.summary-result {
  margin-top: 12px;
  padding: 16px;
  background: linear-gradient(180deg, #f0fdf4 0%, #ecfdf5 100%);
  border: 1px solid #d7f3de;
  border-radius: 14px;
}

.summary-result__status {
  font-size: 13px;
  font-weight: 700;
  color: #137333;
}

.summary-result__text {
  margin-top: 8px;
  line-height: 1.9;
  color: #446057;
}

.summary-panel__empty {
  margin-top: 12px;
  padding: 16px;
  line-height: 1.8;
  color: #6b7280;
  background: #f8fafc;
  border-radius: 14px;
}

.rule-card /deep/ .el-card__body {
  height: calc(100% - 57px);
}

.rule-panel {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.rule-panel__title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
}

.rule-panel__desc {
  margin-top: 10px;
  line-height: 1.8;
  color: #5b6472;
}

.rule-panel__block {
  margin-top: 22px;
}

.rule-panel__block-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.rule-panel__tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 12px;
}

.rule-panel__tag {
  margin: 0 8px 8px 0;
  padding: 6px 12px;
  font-size: 12px;
  color: #0f766e;
  background: #ecfdf5;
  border-radius: 999px;
}

.rule-panel__line {
  margin-top: 12px;
  padding-left: 14px;
  line-height: 1.8;
  color: #606266;
  border-left: 3px solid #dbeafe;
}

.rule-panel__notice {
  margin-top: auto;
  padding: 16px;
  line-height: 1.8;
  color: #5b6472;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 14px;
}

@media (max-width: 1200px) {
  .content-grid,
  .scenario-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .form-actions {
    flex-wrap: wrap;
    padding-left: 0;
  }

  .form-actions .el-button {
    margin-bottom: 12px;
  }

  .card-header--between {
    align-items: flex-start;
    flex-direction: column;
  }

  .card-header--between .el-tag {
    margin-top: 8px;
  }
}
</style>
