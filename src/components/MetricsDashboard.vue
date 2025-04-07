<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabaseClient'

// Estados
const activaciones = ref([])
const loading = ref(true)
const errorMsg = ref(null)

// Filtros
const filtroPlaza = ref('')
const filtroImpulsador = ref('')
const filtroFecha = ref('')

// Cargar datos
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

// Activaciones filtradas
const activacionesFiltradas = computed(() => {
  return activaciones.value.filter((a) => {
    const coincidePlaza = !filtroPlaza.value || a.plaza === filtroPlaza.value
    const coincideImpulsador = !filtroImpulsador.value || a.impulsador?.toLowerCase().includes(filtroImpulsador.value.toLowerCase())
    const coincideFecha = !filtroFecha.value || a.fecha_activacion === filtroFecha.value
    return coincidePlaza && coincideImpulsador && coincideFecha
  })
})

// Total y métricas
const totalActivaciones = computed(() => activacionesFiltradas.value.length)

const metricas = computed(() => {
  const campos = [
    'descargo_app',
    'registro',
    'cash_in',
    'cash_out',
    'p2p',
    'qr_fisico',
    'respaldo',
    'hubo_error',
  ]
  const resultados = {}

  for (const campo of campos) {
    const conteo = activacionesFiltradas.value.filter(a => a[campo] === true).length
    const porcentaje = totalActivaciones.value ? (conteo / totalActivaciones.value) * 100 : 0
    resultados[campo] = { conteo, porcentaje }
  }

  return resultados
})
</script>

<template>
  <div>
    <h2>📊 Métricas de Activaciones</h2>

    <!-- Filtros -->
    <div style="margin-bottom: 1.5rem;">
      <label>
        📅 Fecha:
        <input type="date" v-model="filtroFecha" />
      </label>

      <label style="margin-left: 1rem;">
        👤 Impulsador:
        <input type="text" v-model="filtroImpulsador" placeholder="Buscar impulsador" />
      </label>

      <label style="margin-left: 1rem;">
        🏙️ Plaza:
        <select v-model="filtroPlaza">
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

    <!-- Gráficos -->
    <p v-if="loading">Cargando datos...</p>
    <p v-else-if="errorMsg" style="color: red;">{{ errorMsg }}</p>

    <div v-else>
      <p v-if="totalActivaciones === 0">No hay datos para los filtros seleccionados.</p>
      <div v-else>
        <p><strong>Total de Activaciones:</strong> {{ totalActivaciones }}</p>

        <div
          v-for="(valor, key) in metricas"
          :key="key"
          style="margin-bottom: 1rem;"
        >
          <strong>{{ key.replace(/_/g, ' ').toUpperCase() }}</strong>
          <div style="background: #eee; border-radius: 6px; overflow: hidden;">
            <div
              :style="{
                width: valor.porcentaje + '%',
                background: '#42b983',
                padding: '4px',
                color: 'white',
              }"
            >
              {{ valor.conteo }} / {{ totalActivaciones }} ({{ valor.porcentaje.toFixed(1) }}%)
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input,
select {
  padding: 4px;
  font-size: 13px;
  margin-left: 5px;
}
</style>
