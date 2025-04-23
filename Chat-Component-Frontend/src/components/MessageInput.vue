<template>
    <div class="message-input d-flex">
      <input v-model="message" 
             @keyup.enter="handleSend" 
             class="form-control" 
             type="text" 
             placeholder="Write a message..." />
      <button @click="handleSend" class="btn btn-primary ms-2">Send</button>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        message: ''
      };
    },
    methods: {
      handleSend() {
        if (this.message.trim()) {
          this.$emit('sendMessage', this.message);
          this.message = '';
        }
      }
    }
  };
  </script>
  
  <style>
  .message-input {
    padding: 10px;
    border-top: 1px solid #ccc;
  }
  </style>