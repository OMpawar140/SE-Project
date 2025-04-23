<template>
    <div :class="['bg-dark text-white p-3', collapsed ? 'w-20' : 'w-64']" style="min-height: 100vh;">
      
      <button @click="$emit('toggleCollapse')" class="btn btn-sm btn-outline-light mb-4">
        {{ collapsed ? '>>' : '<<' }}
      </button>
  
      <div class="d-grid gap-2">
        <button class="btn btn-outline-light btn-sm" @click="$emit('navigate', 'dashboard')">
          {{ collapsed ? 'D' : 'Dashboard' }}
        </button>
        <button class="btn btn-outline-light btn-sm" @click="$emit('navigate', 'createsession')">
          {{ collapsed ? 'C' : 'Create Session' }}
        </button>
        <button class="btn btn-outline-light btn-sm" @click="$emit('navigate', 'mysessions')">
          {{ collapsed ? 'M' : 'My Sessions' }}
        </button>
        <button class="btn btn-outline-danger btn-sm " @click="$emit('logout')">
          {{ collapsed ? 'L' : 'Logout' }}
        </button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: ["collapsed"],
  };
  </script>
  
  