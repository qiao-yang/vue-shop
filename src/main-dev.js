// 开发阶段入口文件
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
import './plugins/element.js'
import VueQuillEditor from 'vue-quill-editor'
// 导入网络进度条
import NProgress from 'nprogress'

// 导入全局样式表
import './assets/css/gloabl.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入富文本对应的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
// 导入网络进度条css
import 'nprogress/nprogress.css'

// 配置请求的根路径
var instance = axios.create({
  baseURL: 'http://127.0.0.1:8888/api/private/v1/'
})
// axios.defaults.baseUrl = 'http://127.0.0.1:8888/api/private/v1/'

// 拦截器，判断有没有携带token
instance.interceptors.request.use(config => {
	NProgress.start()
	config.headers.Authorization = window.sessionStorage.getItem('token')
	return config
})
instance.interceptors.response.use(config => {
	NProgress.done()
	return config
})

Vue.prototype.$http = instance

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)
// 全局注册富文本组件
Vue.use(VueQuillEditor)

// 处理日期的方法
Vue.filter('dateFormat', function(originVal) {
  const dt = new Date(originVal)
  // 获取年月日
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  // 获取时分秒
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  // 返回模板字符串
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
