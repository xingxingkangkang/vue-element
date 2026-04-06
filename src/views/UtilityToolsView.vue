<template>
  <div class="utility-tools-page">
    <el-card shadow="never" class="hero-card">
      <div slot="header" class="card-header card-header--between">
        <div>
          <div class="hero-title">实用小工具</div>
          <div class="hero-desc">
            将按空格分隔的多行文本快速转换为 JSON 数组，适合整理批量参数。
          </div>
        </div>
        <el-button type="primary" @click="dialogVisible = true">
          打开转换弹框
        </el-button>
      </div>

      <el-alert
        title="每行是一条记录，字段之间使用一个或多个空格分隔。系统会根据字段数量要求输入对应的参数名。"
        type="info"
        :closable="false"
        show-icon
      />

      <div class="example-block">
        <div class="example-block__title">示例输入</div>
        <pre class="example-block__content">{{ sampleInput }}</pre>
      </div>
    </el-card>

    <el-dialog
      title="文本转 JSON 工具"
      :visible.sync="dialogVisible"
      width="880px"
    >
      <div class="dialog-section">
        <div class="section-title">1. 输入原始内容</div>
        <el-input
          v-model="rawText"
          type="textarea"
          :rows="8"
          resize="none"
          placeholder="每行一条记录，元素之间用空格分隔，例如：200591 172"
        />
        <div class="section-tip">
          <span>已识别 {{ parsedInfo.rowCount }} 条记录</span>
          <span v-if="parsedInfo.fieldCount > 0">每条记录 {{ parsedInfo.fieldCount }} 个元素</span>
        </div>
        <el-alert
          v-if="parsedInfo.message"
          :title="parsedInfo.message"
          :type="parsedInfo.status"
          :closable="false"
          show-icon
        />
      </div>

      <div class="dialog-section">
        <div class="section-title">2. 输入参数名</div>
        <div v-if="parsedInfo.fieldCount > 0" class="field-grid">
          <el-input
            v-for="(field, index) in fieldNames"
            :key="index"
            v-model.trim="fieldNames[index]"
            :placeholder="`请输入第 ${index + 1} 个参数名`"
          >
            <template slot="prepend">参数 {{ index + 1 }}</template>
          </el-input>
        </div>
        <el-empty
          v-else
          :image-size="90"
          description="请先输入格式正确的原始内容"
        />
      </div>

      <div class="dialog-section">
        <div class="section-title">3. 生成结果</div>
        <div class="actions">
          <el-button type="primary" @click="handleGenerate">
            生成 JSON
          </el-button>
          <el-button @click="handleCopy">
            复制 JSON
          </el-button>
          <el-button @click="handleReset">
            重置
          </el-button>
        </div>
        <el-input
          v-model="jsonResult"
          type="textarea"
          :rows="12"
          resize="none"
          readonly
          placeholder="这里会展示生成后的 JSON 内容"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script>
function parseRawText(rawText) {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (!lines.length) {
    return {
      status: 'info',
      message: '请输入需要转换的原始内容。',
      rowCount: 0,
      fieldCount: 0,
      rows: []
    }
  }

  const rows = lines.map((line) => line.split(/\s+/))
  const fieldCount = rows[0].length
  const hasInvalidRow = rows.some((row) => row.length !== fieldCount)

  if (hasInvalidRow) {
    return {
      status: 'warning',
      message: '检测到记录的元素个数不一致，请先确认每一行的字段数量相同。',
      rowCount: rows.length,
      fieldCount: 0,
      rows: []
    }
  }

  return {
    status: 'success',
    message: `格式识别成功，共 ${rows.length} 条记录，每条记录 ${fieldCount} 个元素。`,
    rowCount: rows.length,
    fieldCount,
    rows
  }
}

export default {
  name: 'UtilityToolsView',
  data() {
    return {
      dialogVisible: false,
      rawText: '200591 172\n128530 2\n170661 100',
      fieldNames: ['', ''],
      jsonResult: ''
    }
  },
  computed: {
    sampleInput() {
      return '200591 172\n128530 2\n170661 100'
    },
    parsedInfo() {
      return parseRawText(this.rawText)
    }
  },
  watch: {
    'parsedInfo.fieldCount': {
      immediate: true,
      handler(fieldCount) {
        if (!fieldCount) {
          this.fieldNames = []
          return
        }

        this.fieldNames = Array.from({ length: fieldCount }, (_, index) => {
          return this.fieldNames[index] || ''
        })
      }
    }
  },
  methods: {
    handleGenerate() {
      if (!this.parsedInfo.rows.length) {
        this.$message.warning('请先输入格式正确的原始内容。')
        return
      }

      const emptyField = this.fieldNames.findIndex((field) => !field)

      if (emptyField !== -1) {
        this.$message.warning(`请填写第 ${emptyField + 1} 个参数名。`)
        return
      }

      const uniqueFieldNames = new Set(this.fieldNames)

      if (uniqueFieldNames.size !== this.fieldNames.length) {
        this.$message.warning('参数名不能重复，请调整后再生成。')
        return
      }

      const result = this.parsedInfo.rows.map((row) => {
        return row.reduce((record, value, index) => {
          record[this.fieldNames[index]] = value
          return record
        }, {})
      })

      this.jsonResult = JSON.stringify(result, null, 4)
      this.$message.success('JSON 已生成。')
    },
    handleCopy() {
      if (!this.jsonResult) {
        this.$message.warning('请先生成 JSON 内容。')
        return
      }

      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(this.jsonResult)
          .then(() => {
            this.$message.success('JSON 已复制到剪贴板。')
          })
          .catch(() => {
            this.copyByCommand()
          })

        return
      }

      this.copyByCommand()
    },
    copyByCommand() {
      const textarea = document.createElement('textarea')
      textarea.value = this.jsonResult
      textarea.setAttribute('readonly', 'readonly')
      textarea.style.position = 'fixed'
      textarea.style.top = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()

      try {
        document.execCommand('copy')
        this.$message.success('JSON 已复制到剪贴板。')
      } catch (error) {
        this.$message.error('复制失败，请手动复制。')
      } finally {
        document.body.removeChild(textarea)
      }
    },
    handleReset() {
      this.rawText = ''
      this.fieldNames = []
      this.jsonResult = ''
    }
  }
}
</script>

<style scoped>
.utility-tools-page {
  display: flex;
  flex-direction: column;
}

.hero-card {
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
  gap: 16px;
}

.hero-title {
  font-size: 22px;
  font-weight: 700;
  color: #303133;
}

.hero-desc {
  margin-top: 8px;
  line-height: 1.8;
  color: #606266;
}

.example-block {
  margin-top: 18px;
  padding: 18px 20px;
  background: #f8fafc;
  border: 1px solid #e5eaf3;
  border-radius: 14px;
}

.example-block__title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.example-block__content {
  margin: 12px 0 0;
  padding: 14px 16px;
  overflow: auto;
  background: #0f172a;
  color: #dbeafe;
  border-radius: 10px;
  line-height: 1.8;
}

.dialog-section + .dialog-section {
  margin-top: 24px;
}

.section-title {
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.section-tip {
  display: flex;
  gap: 16px;
  margin: 10px 0 0;
  font-size: 13px;
  color: #606266;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.actions {
  margin-bottom: 12px;
}

.actions .el-button + .el-button {
  margin-left: 12px;
}

@media (max-width: 768px) {
  .card-header--between {
    align-items: flex-start;
    flex-direction: column;
  }

  .field-grid {
    grid-template-columns: 1fr;
  }
}
</style>
