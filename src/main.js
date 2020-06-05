/* eslint-disable no-undef */
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
import './plugins/element.js'

// 导入全局样式表
import './assets/css/gloabl.css'
// 导入字体图标
import './assets/fonts/iconfont.css'

// 配置请求的根路径
var instance = axios.create({
  baseURL: 'http://127.0.0.1:8888/api/private/v1/'
})
// axios.defaults.baseUrl = 'http://127.0.0.1:8888/api/private/v1/'

// 拦截器，判断有没有携带token
instance.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

Vue.prototype.$http = instance

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
