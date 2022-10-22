import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 面包屑组件
import Breadcrumb from './components/Breadcrumb.vue'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'

import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/' 
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('Breadcrumb', Breadcrumb)
Vue.use(VueQuillEditor)

Vue.filter('dateFormat', function(date) {
  let dt = new Date(date)

  let y = dt.getFullYear()
  let m = (dt.getMonth() + 1 + '').padStart(2, '0')
  let d = (dt.getDate() + '').padStart(2, '0')

  let hh = (dt.getHours() + 1 + '').padStart(2, '0')
  let mm = (dt.getMinutes() + 1 + '').padStart(2, '0')
  let ss = (dt.getSeconds() + 1 + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
