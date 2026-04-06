import WelcomeView from '@/views/WelcomeView.vue'
import FormPracticeView from '@/views/FormPracticeView.vue'
import TablePracticeView from '@/views/TablePracticeView.vue'
import DialogPracticeView from '@/views/DialogPracticeView.vue'
import CardPracticeView from '@/views/CardPracticeView.vue'
import SealAlgorithmVerifyView from '@/views/SealAlgorithmVerifyView.vue'
import GenerateVerifyTaskView from '@/views/GenerateVerifyTaskView.vue'
import UtilityToolsView from '@/views/UtilityToolsView.vue'

export const menuRoutes = [
  {
    path: 'welcome',
    name: 'welcome',
    component: WelcomeView,
    meta: {
      title: '开始页',
      icon: 'el-icon-house'
    }
  },
  {
    path: 'form-practice',
    name: 'form-practice',
    component: FormPracticeView,
    meta: {
      title: '表单练习',
      icon: 'el-icon-edit-outline'
    }
  },
  {
    path: 'table-practice',
    name: 'table-practice',
    component: TablePracticeView,
    meta: {
      title: '表格练习',
      icon: 'el-icon-tickets'
    }
  },
  {
    path: 'dialog-practice',
    name: 'dialog-practice',
    component: DialogPracticeView,
    meta: {
      title: '弹层练习',
      icon: 'el-icon-message-solid'
    }
  },
  {
    path: 'card-practice',
    name: 'card-practice',
    component: CardPracticeView,
    meta: {
      title: '卡片与标签',
      icon: 'el-icon-collection'
    }
  },
  {
    path: 'seal-algorithm-verify',
    name: 'seal-algorithm-verify',
    component: SealAlgorithmVerifyView,
    meta: {
      title: '验印算法验证',
      icon: 'el-icon-data-analysis'
    }
  },
  {
    path: 'generate-verify-task',
    name: 'generate-verify-task',
    component: GenerateVerifyTaskView,
    meta: {
      title: '生成验证任务',
      icon: 'el-icon-s-operation'
    }
  },
  {
    path: 'utility-tools',
    name: 'utility-tools',
    component: UtilityToolsView,
    meta: {
      title: '实用小工具',
      icon: 'el-icon-magic-stick'
    }
  }
]
