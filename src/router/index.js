import Vue from 'vue'
import Router from 'vue-router'

import MainLayout from '@/layout/MainLayout.vue'
import { menuRoutes } from './menuRoutes'

Vue.use(Router)

const childRoutes = menuRoutes.map((route) => ({
  ...route,
  path: `/${route.path}`
}))

export default new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      component: MainLayout,
      redirect: '/welcome',
      children: childRoutes
    }
  ]
})
