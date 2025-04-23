<template>
    <div>
      <h2 v-if="user" class="mt-4">Welcome, {{ user }}</h2>
      <p v-else>Loading user data...</p>
    </div>
  </template>
  
  <script>
  export default {
    props: ["user"],
  };
  </script>
  