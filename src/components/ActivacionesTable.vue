<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabaseClient'
import * as XLSX from 'xlsx'

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
    const plaza = a.plaza?.toLowerCase() || ''
    const impulsador = a.impulsador?.toLowerCase() || ''
    const fecha = a.fecha_activacion || ''

    const coincidePlaza = !filtroPlaza.value || plaza.includes(filtroPlaza.value.toLowerCase())
    const coincideImpulsador = !filtroImpulsador.value || impulsador.includes(filtroImpulsador.value.toLowerCase())
    const coincideFecha = !filtroFecha.value || fecha === filtroFecha.value

    return coincidePlaza && coincideImpulsador && coincideFecha
  })
})

function exportarAExcel() {
  const hayFiltros = filtroPlaza.value || filtroImpulsador.value || filtroFecha.value

  const datosParaExportar = hayFiltros
    ? activacionesFiltradas.value
    : activaciones.value

  if (datosParaExportar.length === 0) {
    alert('No hay datos para exportar.')
    return
  }

  const datosPlano = datosParaExportar.map((a) => ({
    ID: a.id,
    Fecha: a.fecha_activacion,
    Impulsador: a.impulsador,
    Plaza: a.plaza,
    'Lugar Activación': a.lugar_activacion,
    'Nombres Cliente': a.nombres_cliente,
    'Apellidos Cliente': a.apellidos_cliente,
    'CI Cliente': a.ci_cliente,
    'Teléfono Cliente': a.telefono_cliente,
    'Email Cliente': a.email_cliente,
    '¿Descargó App?': a.descargo_app ? 'Sí' : 'No',
    'Registro': a.registro ? 'Sí' : 'No',
    'Cash In': a.cash_in ? 'Sí' : 'No',
    'Cash Out': a.cash_out ? 'Sí' : 'No',
    'P2P': a.p2p ? 'Sí' : 'No',
    'QR Físico': a.qr_fisico ? 'Sí' : 'No',
    'Respaldo': a.respaldo ? 'Sí' : 'No',
    '¿Hubo Error?': a.hubo_error ? 'Sí' : 'No',
    'Descripción Error': a.descripcion_error ?? '',
    'Tipo Activación': a.tipo_activacion,
    'Tipo Comercio': a.tipo_comercio,
    'Tamaño Tienda': a.tamano_tienda,
    'Foto': a.foto_url
      ? { f: `HYPERLINK("${a.foto_url}","Ver foto")` }
      : '',
    'Latitud': a.latitud,
    'Longitud': a.longitud,
    'Usuario ID': a.usuario_id,
    'Creado': a.created_at,
  }))

  const worksheet = XLSX.utils.json_to_sheet(datosPlano)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Activaciones')
  XLSX.writeFile(workbook, 'activaciones.xlsx')
}
</script>
<template>
  <div class="activaciones-container">
    <h2>📋 Lista Completa de Activaciones</h2>

    <!-- Filtros -->
    <div class="filtros">
      <label>
        📅 Fecha:
        <input type="date" v-model="filtroFecha" />
      </label>

      <label>
        👤 Impulsador:
        <input type="text" v-model="filtroImpulsador" placeholder="Buscar impulsador" />
      </label>

      <label>
        🏙️ Plaza:
        <input type="text" v-model="filtroPlaza" placeholder="Buscar plaza" />
      </label>
    </div>

    <button @click="exportarAExcel" class="boton-exportar">
      📥 Exportar datos a Excel
    </button>

    <p v-if="loading">Cargando datos...</p>
    <p v-else-if="errorMsg" class="mensaje-error">{{ errorMsg }}</p>

    <table v-else class="tabla-activaciones">
      <thead>
        <tr>
          <th>#</th>
          <th>ID</th>
          <th>Creado</th>
          <th>Impulsador</th>
          <th>Lugar Activación</th>
          <th>Fecha</th>
          <th>Nombres</th>
          <th>Apellidos</th>
          <th>CI</th>
          <th>Teléfono</th>
          <th>Email</th>
          <th>Descargó App</th>
          <th>Registro</th>
          <th>Cash In</th>
          <th>Cash Out</th>
          <th>P2P</th>
          <th>QR Físico</th>
          <th>Respaldo</th>
          <th>¿Error?</th>
          <th>Descripción Error</th>
          <th>Tipo Activación</th>
          <th>Tipo Comercio</th>
          <th>Tamaño Tienda</th>
          <th>Foto</th>
          <th>Latitud</th>
          <th>Longitud</th>
          <th>Usuario ID</th>
          <th>Plaza</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(a, i) in activacionesFiltradas" :key="a.id">
          <td>{{ i + 1 }}</td>
          <td>{{ a.id }}</td>
          <td>{{ a.created_at }}</td>
          <td>{{ a.impulsador }}</td>
          <td>{{ a.lugar_activacion }}</td>
          <td>{{ a.fecha_activacion }}</td>
          <td>{{ a.nombres_cliente }}</td>
          <td>{{ a.apellidos_cliente }}</td>
          <td>{{ a.ci_cliente }}</td>
          <td>{{ a.telefono_cliente }}</td>
          <td>{{ a.email_cliente }}</td>
          <td>{{ a.descargo_app ? 'Sí' : 'No' }}</td>
          <td>{{ a.registro ? 'Sí' : 'No' }}</td>
          <td>{{ a.cash_in ? 'Sí' : 'No' }}</td>
          <td>{{ a.cash_out ? 'Sí' : 'No' }}</td>
          <td>{{ a.p2p ? 'Sí' : 'No' }}</td>
          <td>{{ a.qr_fisico ? 'Sí' : 'No' }}</td>
          <td>{{ a.respaldo ? 'Sí' : 'No' }}</td>
          <td>{{ a.hubo_error ? 'Sí' : 'No' }}</td>
          <td>{{ a.descripcion_error }}</td>
          <td>{{ a.tipo_activacion }}</td>
          <td>{{ a.tipo_comercio }}</td>
          <td>{{ a.tamano_tienda }}</td>
          <td>
            <div class="contenedor-foto" v-if="a.foto_url">
              <img :src="a.foto_url" alt="Miniatura" class="miniatura-hover" />
            </div>
          </td>
          <td>{{ a.latitud }}</td>
          <td>{{ a.longitud }}</td>
          <td>{{ a.usuario_id }}</td>
          <td>{{ a.plaza }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
