<script setup>
</script>

<template>
  <div>
    <nav style="margin-bottom: 2rem;">
      <router-link to="/activaciones" style="margin-right: 1rem;">📋 Activaciones</router-link>
      <router-link to="/impulsadores">🧑‍💼 Impulsadores</router-link>
      <router-link to="/metricas">📈 Métricas</router-link>
    </nav>

    <router-view />
  </div>
</template>
