<template>
    <div class="teacher-panel">
      <h2>Teacher Panel</h2>
      <label>
        <input type="checkbox" v-model="chatEnabled" @change="toggleChat" />
        Enable Chat
      </label>
      <div v-if="messages.length > 0" class="chat-window">
        <h3>Messages</h3>
        <div v-for="message in messages" :key="message.id" class="message">
          <p>
            <strong>{{ message.anonymous ? 'Anonymous' : message.sender }}</strong
            >: {{ message.content }}
            <span v-if="message.anonymous" class="text-muted">(User: {{ message.sender }})</span>
          </p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        chatEnabled: false,
        messages: [], // Chat messages received
      };
    },
    methods: {
      toggleChat() {
        fetch('http://localhost:3000/api/chat/toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled: this.chatEnabled }),
        });
      },
      listenForMessages() {
        const eventSource = new EventSource('http://localhost:3000/api/chat/stream');
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'new-message') {
            this.messages.push(data.message);
          }
        };
      },
    },
    created() {
      this.listenForMessages();
    },
  };
  </script>
  
  <style>
  .teacher-panel {
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
  }
  .chat-window {
    margin-top: 20px;
    padding: 10px;
    border: 1px solid black;
  }
  .message {
    padding: 5px 0;
  }
  </style>
  