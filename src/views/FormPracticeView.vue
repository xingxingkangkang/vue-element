<template>
  <div class="page">
    <el-row :gutter="20">
      <el-col :span="14">
        <el-card shadow="never">
          <div slot="header" class="card-header">
            <span>表单练习</span>
          </div>

          <el-form
            ref="practiceForm"
            :model="form"
            :rules="rules"
            label-width="100px"
          >
            <el-form-item label="活动名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入活动名称" />
            </el-form-item>

            <el-form-item label="活动区域" prop="region">
              <el-select v-model="form.region" placeholder="请选择活动区域">
                <el-option label="北京" value="beijing" />
                <el-option label="上海" value="shanghai" />
                <el-option label="深圳" value="shenzhen" />
              </el-select>
            </el-form-item>

            <el-form-item label="活动时间" prop="date">
              <el-date-picker
                v-model="form.date"
                type="date"
                placeholder="选择日期"
                style="width: 100%;"
              />
            </el-form-item>

            <el-form-item label="即时配送">
              <el-switch v-model="form.delivery" />
            </el-form-item>

            <el-form-item label="活动性质">
              <el-checkbox-group v-model="form.type">
                <el-checkbox label="线上活动" />
                <el-checkbox label="线下沙龙" />
                <el-checkbox label="技术分享" />
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="推荐程度">
              <el-radio-group v-model="form.level">
                <el-radio label="入门" />
                <el-radio label="进阶" />
                <el-radio label="强化" />
              </el-radio-group>
            </el-form-item>

            <el-form-item label="活动备注">
              <el-input
                v-model="form.desc"
                type="textarea"
                :rows="4"
                placeholder="写一些说明"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="submitForm">立即创建</el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="10">
        <el-card shadow="hover">
          <div slot="header" class="card-header">
            <span>当前数据预览</span>
          </div>
          <pre class="preview">{{ formattedForm }}</pre>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
const createDefaultForm = () => ({
  name: '',
  region: '',
  date: '',
  delivery: false,
  type: [],
  level: '入门',
  desc: ''
})

export default {
  name: 'FormPracticeView',
  data() {
    return {
      form: createDefaultForm(),
      rules: {
        name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' }
        ],
        region: [
          { required: true, message: '请选择活动区域', trigger: 'change' }
        ],
        date: [
          { required: true, message: '请选择活动时间', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    formattedForm() {
      return JSON.stringify(this.form, null, 2)
    }
  },
  methods: {
    submitForm() {
      this.$refs.practiceForm.validate((valid) => {
        if (!valid) {
          return
        }

        this.$message.success('表单校验通过，可以继续接接口或保存数据。')
      })
    },
    resetForm() {
      this.$refs.practiceForm.resetFields()
      this.form = createDefaultForm()
    }
  }
}
</script>

<style scoped>
.card-header {
  font-weight: 600;
}

.preview {
  margin: 0;
  padding: 16px;
  min-height: 360px;
  overflow: auto;
  background: #0f172a;
  color: #dbeafe;
  border-radius: 8px;
  line-height: 1.7;
}
</style>
