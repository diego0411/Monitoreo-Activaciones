<!-- src/App.vue -->
<script setup>
import './style.css' // Asegúrate que esta ruta sea correcta
</script>

<template>
  <div>
    <nav class="main-nav">
      <router-link to="/activaciones">📋 Activaciones</router-link>
      <router-link to="/impulsadores">🧑‍💼 Impulsadores</router-link>
      <router-link to="/metricas">📈 Métricas</router-link>
      <router-link to="/usuarios">👤 Usuarios</router-link>
    </nav>

    <router-view />
  </div>
</template>
