<template>
  <ThemeProvider>
    <router-view />
  </ThemeProvider>
</template>

<script setup>
import ThemeProvider from './components/ThemeProvider.vue'; 
</script>

<style>
#app {
  min-height: 100vh;
}
</style>