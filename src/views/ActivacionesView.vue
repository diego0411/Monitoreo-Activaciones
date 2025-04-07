<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'
import ActivacionesTable from '../components/ActivacionesTable.vue'

const activaciones = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  const { data, error: err } = await supabase.from('activaciones').select('*')
  if (err) {
    console.error('Error al obtener datos:', err)
    error.value = 'Ocurrió un error al obtener los datos.'
  } else {
    activaciones.value = data
  }
  loading.value = false
})
</script>

<template>
  <div>
    <h2>📋 Lista de Activaciones</h2>
    <p v-if="loading">Cargando...</p>
    <p v-if="error" style="color: red">{{ error }}</p>
    <ActivacionesTable v-if="!loading && !error" :activaciones="activaciones" />
  </div>
</template>
