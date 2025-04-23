<template>
    <div :class="themeClass" >
      <slot />
      <button @click="toggleTheme" class="toggle-theme-btn">
        <i v-if="theme === 'dark'" class="pi pi-sun"></i>
        <i v-else class="pi pi-moon"></i>
  </button>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  
  const theme = ref('dark');
  
  onMounted(() => {
    const stored = localStorage.getItem('theme');
    if (stored) theme.value = stored;
    
    // Apply the stored theme class to the body
    document.body.classList.add(theme.value === 'dark' ? 'dark-theme' : 'light-theme');
  });
  
  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', theme.value);
    
    // Update body class accordingly
    document.body.classList.toggle('dark-theme', theme.value === 'dark');
    document.body.classList.toggle('light-theme', theme.value === 'light');
  };
  
  const themeClass = computed(() => {
    return theme.value === 'dark' ? 'dark-theme' : 'light-theme';
  });
  </script>
  
  <style>
  .dark-theme {
    background-color: #1e1e1e;
    color: #fff;
  }
  
  .light-theme {
    background-color: #f5f5f5;
    color: #000;
  }
  
  .toggle-theme-btn {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    background-color: #171717;
    color: white;
    font-weight: bold;
  }
  </style>