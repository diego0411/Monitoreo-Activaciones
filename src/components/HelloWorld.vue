<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'

const activaciones = ref([])
const loading = ref(true)
const errorMsg = ref(null)

onMounted(async () => {
  const { data, error } = await supabase.from('activaciones').select('*')
  if (error) {
    console.error('❌ Error al cargar datos:', error)
    errorMsg.value = 'Ocurrió un error al obtener las activaciones.'
  } else {
    activaciones.value = data
  }
  loading.value = false
})
</script>

<template>
  <div>
    <h2>📋 Lista de Activaciones</h2>

    <p v-if="loading">Cargando datos...</p>
    <p v-else-if="errorMsg" style="color: red;">{{ errorMsg }}</p>
    <table v-else>
      <thead>
        <tr>
          <th>#</th>
          <th>Cliente</th>
          <th>CI</th>
          <th>Teléfono</th>
          <th>Dirección</th>
          <th>Fecha</th>
          <th>Tipo Activación</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(a, i) in activaciones" :key="a.id">
          <td>{{ i + 1 }}</td>
          <td>{{ a.nombres_cliente }} {{ a.apellidos_cliente }}</td>
          <td>{{ a.ci_cliente }}</td>
          <td>{{ a.telefono_cliente }}</td>
          <td>
            {{ a.calle }}<br />
            {{ a.distrito }} - {{ a.ciudad }}<br />
            {{ a.provincia }} - {{ a.departamento }}
          </td>
          <td>{{ a.fecha_activacion }}</td>
          <td>{{ a.tipo_activacion }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
table {
  border-collapse: collapse;
  margin-top: 1rem;
  width: 100%;
  font-size: 14px;
}

th {
  background: #f0f0f0;
  text-align: left;
  padding: 8px;
}

td {
  border: 1px solid #ccc;
  padding: 6px;
  vertical-align: top;
}

tr:nth-child(even) {
  background-color: #fafafa;
}
</style>
