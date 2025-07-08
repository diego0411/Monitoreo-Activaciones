// src/router.js
import { createRouter, createWebHistory } from 'vue-router'
import ActivacionesPage from './pages/ActivacionesPage.vue'
import ImpulsadoresPage from './pages/ImpulsadoresPage.vue'
import MetricsDashboard from './components/MetricsDashboard.vue'
import Usuarios from './components/Usuarios.vue' // asegúrate de crearlo o moverlo a esta ruta

const routes = [
  { path: '/', redirect: '/activaciones' },
  { path: '/activaciones', component: ActivacionesPage },
  { path: '/impulsadores', component: ImpulsadoresPage },
  { path: '/metricas', component: MetricsDashboard },
  { path: '/usuarios', component: Usuarios }, // <-- nuevo
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
