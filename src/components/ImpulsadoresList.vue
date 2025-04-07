<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'

const impulsadores = ref([])
const loading = ref(true)
const errorMsg = ref(null)

onMounted(async () => {
  const { data, error } = await supabase.from('activadores').select('*')
  if (error) {
    console.error('❌ Error al cargar impulsadores:', error)
    errorMsg.value = 'Error al obtener los impulsadores.'
  } else {
    impulsadores.value = data
  }
  loading.value = false
})
</script>

<template>
  <div>
    <h2>👤 Lista de Impulsadores Registrados</h2>

    <p v-if="loading">Cargando...</p>
    <p v-else-if="errorMsg" style="color: red;">{{ errorMsg }}</p>
    <table v-else>
      <thead>
        <tr>
          <th>#</th>
          <th>Usuario ID</th>
          <th>Nombre</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(i, index) in impulsadores" :key="i.usuario_id">
          <td>{{ index + 1 }}</td>
          <td>{{ i.usuario_id }}</td>
          <td>{{ i.nombre }}</td>
          <td>{{ i.email }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  margin-top: 1rem;
}
th, td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}
th {
  background-color: #f4f4f4;
}
tr:nth-child(even) {
  background-color: #fafafa;
}
</style>
