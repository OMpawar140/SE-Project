<template>
    <div class="chat-window d-flex flex-column bg-light">
      <div class="chat-header bg-dark text-white p-3 d-flex align-items-center">
        <h6>{{ activeChat.name }}</h6>
      </div>
  
      <div class="chat-body flex-grow-1 p-3">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="['message', message.isTeacher ? 'bg-primary text-white' : 'bg-secondary text-white']"
        >
          <p class="mb-1"><strong>{{ message.sender }}</strong></p>
          <p class="mb-0">{{ message.text }}</p>
        </div>
      </div>
  
      <MessageInput @sendMessage="sendMessage" />
    </div>
  </template>
  
  <script>
  import MessageInput from './MessageInput.vue';
  
  export default {
    components: { MessageInput },
    data() {
      return {
        activeChat: { name: 'General Chat' },
        messages: [], // Messages array to display real-time updates
        eventSource: null, // SSE connection
      };
    },
    methods: {
      sendMessage(text) {
        // Mock client-side message sending
        this.messages.push({
          id: this.messages.length + 1,
          sender: 'You',
          text,
          isTeacher: true,
        });
  
        // Optionally send to backend (if you implemented POST for sending messages)
        fetch('http://localhost:3000/api/chat/send-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sender: 'You', text }),
        });
      },
      setupSSE() {
        // Connect to your SSE backend
        this.eventSource = new EventSource('http://localhost:3000/api/chat/stream'); // Adjust URL to match your backend
  
        this.eventSource.onmessage = (event) => {
          const message = JSON.parse(event.data); // Parse incoming SSE message
          this.messages.push(message);
        };
  
        this.eventSource.onerror = () => {
          console.error('SSE connection lost. Reconnecting...');
          if (this.eventSource) {
            this.eventSource.close();
            this.setupSSE(); // Attempt to reconnect
          }
        };
      },
    },
    created() {
      // Establish SSE connection when component is created
      this.setupSSE();
    },
    beforeDestroy() {
      // Close SSE connection when component is destroyed
      if (this.eventSource) {
        this.eventSource.close();
      }
    },
  };
  </script>
  
  <style>
  .chat-window {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  .chat-body {
    overflow-y: auto;
  }
  
  .message {
    padding: 10px;
    border-radius: 8px;
    margin-bottom: 10px;
    max-width: 60%;
  }
  </style>
  