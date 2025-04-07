<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'
import ActivacionesTable from '../components/ActivacionesTable.vue'

const activaciones = ref([])

onMounted(async () => {
  const { data, error } = await supabase.from('activaciones').select('*')
  if (error) console.error('Error al obtener activaciones:', error)
  else activaciones.value = data
})
</script>

<template>
  <div>
    <h1>📋 Activaciones</h1>
    <ActivacionesTable :activaciones="activaciones" />
  </div>
</template>
