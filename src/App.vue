<script setup>
import './style.css'
</script>

<template>
  <div>
    <nav style="margin-bottom: 2rem;">
      <router-link to="/activaciones" style="margin-right: 1rem;">📋 Activaciones</router-link>
      <router-link to="/impulsadores" style="margin-right: 1rem;">🧑‍💼 Impulsadores</router-link>
      <router-link to="/metricas" style="margin-right: 1rem;">📈 Métricas</router-link>
      <router-link to="/usuarios">👤 Usuarios</router-link>
    </nav>

    <router-view />
  </div>
</template>
