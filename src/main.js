import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router' // 👈 importa el router
import '../src/style.css'


createApp(App).use(router).mount('#app') // 👈 usa el router
