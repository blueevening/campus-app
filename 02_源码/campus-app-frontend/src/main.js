import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import api from './api'
import { installBrowserMock } from './mock/browserMock'

// 导入 Vant 组件库
import Vant from 'vant'
import 'vant/lib/index.css'

// 导入全局样式
import './assets/styles/global.css'
import './assets/styles/theme.css'

// 静态托管演示：启用浏览器内 mock，无需 Node 后端
// 本机连真实后端时，可设 VUE_APP_USE_MOCK=0
if (process.env.VUE_APP_USE_MOCK !== '0') {
  installBrowserMock(api)
}

const app = createApp(App)

app.use(Vant)
app.use(store)
app.use(router)
app.mount('#app')

