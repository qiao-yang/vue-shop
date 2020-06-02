import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import './plugins/element.js'

// 导入全局样式表
import './assets/css/gloabl.css'
// 导入字体图标
import './assets/fonts/iconfont.css'

// 配置请求的根路径
axios.defaults.baseUrl = 'http://127.0.0.1:8888/api/private/v1/'

Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
