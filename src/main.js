import Vue from 'vue'
import App from './App.vue'
import VueQrcodeReader from 'vue-qrcode-reader'
import axios from 'axios'

Vue.prototype.$http = axios.create({
  baseURL: 'https://api.sustainability.oregonstate.edu/v2/qrmeters/',
  timeout: 10000,
  withCredentials: true
})

// Vue.component('camera-component', VueCamera);
Vue.use(VueQrcodeReader)

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
