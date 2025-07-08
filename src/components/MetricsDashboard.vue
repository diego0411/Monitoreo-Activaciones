<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabaseClient'

const activaciones = ref([])
const loading = ref(true)
const errorMsg = ref(null)

const filtroPlaza = ref('')
const filtroImpulsador = ref('')
const filtroFecha = ref('')

onMounted(async () => {
  const { data, error } = await supabase.from('activaciones').select('*')
  if (error) {
    console.error('❌ Error al cargar datos:', error)
    errorMsg.value = 'Error al obtener activaciones.'
  } else {
    activaciones.value = data
  }
  loading.value = false
})

const activacionesFiltradas = computed(() => {
  return activaciones.value.filter((a) => {
    const coincidePlaza = !filtroPlaza.value || a.plaza === filtroPlaza.value
    const coincideImpulsador = !filtroImpulsador.value || a.impulsador?.toLowerCase().includes(filtroImpulsador.value.toLowerCase())
    const coincideFecha = !filtroFecha.value || a.fecha_activacion === filtroFecha.value
    return coincidePlaza && coincideImpulsador && coincideFecha
  })
})

const totalActivaciones = computed(() => activacionesFiltradas.value.length)

const metricas = computed(() => {
  const campos = [
    'descargo_app', 'registro', 'cash_in', 'cash_out',
    'p2p', 'qr_fisico', 'respaldo', 'hubo_error',
  ]
  const resultados = {}
  for (const campo of campos) {
    const conteo = activacionesFiltradas.value.filter(a => a[campo] === true).length
    const porcentaje = totalActivaciones.value ? (conteo / totalActivaciones.value) * 100 : 0
    resultados[campo] = { conteo, porcentaje }
  }
  return resultados
})

const topActivadores = computed(() => {
  const conteo = {}
  for (const a of activacionesFiltradas.value) {
    if (!a.impulsador) continue
    conteo[a.impulsador] = (conteo[a.impulsador] || 0) + 1
  }
  const total = totalActivaciones.value
  return Object.entries(conteo)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nombre, cantidad]) => ({
      nombre,
      cantidad,
      porcentaje: total ? (cantidad / total) * 100 : 0
    }))
})

const activacionesPorTipo = computed(() => {
  const conteo = {}
  for (const a of activacionesFiltradas.value) {
    if (!a.tipo_activacion) continue
    conteo[a.tipo_activacion] = (conteo[a.tipo_activacion] || 0) + 1
  }
  const total = totalActivaciones.value
  return Object.entries(conteo)
    .sort((a, b) => b[1] - a[1])
    .map(([tipo, cantidad]) => ({
      tipo,
      cantidad,
      porcentaje: total ? (cantidad / total) * 100 : 0
    }))
})

const activacionesPorPlaza = computed(() => {
  const conteo = {}
  for (const a of activacionesFiltradas.value) {
    if (!a.plaza) continue
    conteo[a.plaza] = (conteo[a.plaza] || 0) + 1
  }
  return Object.entries(conteo)
    .sort((a, b) => b[1] - a[1])
    .map(([plaza, cantidad]) => ({ plaza, cantidad }))
})
</script>

<template>
  <div class="contenedor-metricas">
    <h2 class="titulo-principal">📊 Métricas de Activaciones</h2>

    <div class="filtros">
      <label>
        📅 Fecha:
        <input type="date" v-model="filtroFecha" class="input-texto" />
      </label>
      <label>
        👤 Impulsador:
        <input type="text" v-model="filtroImpulsador" placeholder="Buscar impulsador" class="input-texto" />
      </label>
      <label>
        🏙️ Plaza:
        <select v-model="filtroPlaza" class="input-texto">
          <option value="">Todas</option>
          <option
            v-for="(p, i) in [...new Set(activaciones.map(a => a.plaza).filter(p => p))]"
            :key="i"
            :value="p"
          >
            {{ p }}
          </option>
        </select>
      </label>
    </div>

    <p v-if="loading">Cargando datos...</p>
    <p v-else-if="errorMsg" class="mensaje-error">{{ errorMsg }}</p>

    <div v-else>
      <p v-if="totalActivaciones === 0">No hay datos para los filtros seleccionados.</p>

      <div v-else>
        <p><strong>Total de Activaciones:</strong> {{ totalActivaciones }}</p>

        <div v-for="(valor, key) in metricas" :key="key" class="barra-metrica">
          <strong class="titulo-metrica">{{ key.replace(/_/g, ' ').toUpperCase() }}</strong>
          <div class="barra-base">
            <div class="barra-progreso" :style="{ width: valor.porcentaje + '%' }">
              {{ valor.conteo }} / {{ totalActivaciones }} ({{ valor.porcentaje.toFixed(1) }}%)
            </div>
          </div>
        </div>

        <div class="metricas-top">
          <h3 class="subtitulo">🥇 Top 5 Activadores</h3>
          <div v-for="activador in topActivadores" :key="activador.nombre" class="barra-metrica">
            <strong class="titulo-metrica">{{ activador.nombre }}</strong>
            <div class="barra-base">
              <div class="barra-progreso" :style="{ width: activador.porcentaje + '%' }">
                {{ activador.cantidad }} activaciones ({{ activador.porcentaje.toFixed(1) }}%)
              </div>
            </div>
          </div>
        </div>

        <div class="metricas-top">
          <h3 class="subtitulo">🔥 Tipos de Activación Más Frecuentes</h3>
          <div v-for="tipo in activacionesPorTipo.slice(0, 3)" :key="tipo.tipo" class="barra-metrica">
            <strong class="titulo-metrica">{{ tipo.tipo }}</strong>
            <div class="barra-base">
              <div class="barra-progreso" :style="{ width: tipo.porcentaje + '%' }">
                {{ tipo.cantidad }} ({{ tipo.porcentaje.toFixed(1) }}%)
              </div>
            </div>
          </div>
        </div>

        <div class="metricas-top">
          <h3 class="subtitulo">🏙️ Activaciones por Plaza</h3>
          <div v-for="plaza in activacionesPorPlaza" :key="plaza.plaza" class="barra-metrica">
            <strong class="titulo-metrica">{{ plaza.plaza }}</strong>
            <div class="barra-base">
              <div class="barra-progreso" :style="{ width: (plaza.cantidad / totalActivaciones * 100).toFixed(1) + '%' }">
                {{ plaza.cantidad }} activaciones
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
