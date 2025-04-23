<template>
    <div class="sidebar bg-dark text-white">
      <h5 class="p-3">Chats</h5>
      <ul class="list-group list-group-flush">
        <li v-for="chat in chats" :key="chat.id" 
            class="list-group-item bg-dark text-white d-flex align-items-center">
          <UserAvatar :name="chat.name" :avatar="chat.avatar" />
          <span class="ms-3">{{ chat.name }}</span>
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import UserAvatar from './UserAvatar.vue';
  export default {
    components: { UserAvatar },
    data() {
      return {
        chats: [
          { id: 1, name: 'Jacob Blair', avatar: 'https://via.placeholder.com/40' },
          { id: 2, name: 'Bob Jackson', avatar: 'https://via.placeholder.com/40' },
          { id: 3, name: 'Anonymous', avatar: '' }
        ]
      };
    }
  };
  </script>
  
  <style>
  .sidebar {
    height: 100vh;
    width: 300px;
    overflow-y: auto;
  }
  </style>