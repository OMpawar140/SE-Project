<template>
    <div class="avatar">
      <img v-if="avatar" :src="avatar" alt="Avatar" class="rounded-circle" width="40" height="40" />
      <div v-else class="placeholder-avatar rounded-circle">{{ initials }}</div>
    </div>
  </template>
  
  <script>
  export default {
    props: ['name', 'avatar'],
    computed: {
      initials() {
        return this.name ? this.name.charAt(0).toUpperCase() : '?';
      }
    }
  };
  </script>
  
  <style>
  .avatar img {
    object-fit: cover;
  }
  
  .placeholder-avatar {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: gray;
    color: white;
    font-weight: bold;
  }
  </style>