<template>
    <div class="student-panel">
      <h2>Student Panel</h2>
      <p>
        Chat is <strong>{{ chatEnabled ? 'Enabled' : 'Disabled' }}</strong>
      </p>
      <div v-if="chatEnabled">
        <form @submit.prevent="sendMessage">
          <input
            v-model="content"
            type="text"
            placeholder="Type your message"
            required
          />
          <label>
            <input type="checkbox" v-model="anonymous" />
            Send as Anonymous
          </label>
          <button type="submit">Send</button>
        </form>
        <div v-if="messages.length > 0" class="chat-window">
          <h3>Messages</h3>
          <div v-for="message in messages" :key="message.id" class="message">
            <p>
              <strong>{{ message.anonymous ? 'Anonymous' : message.sender }}</strong
              >: {{ message.content }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        chatEnabled: false,
        content: '',
        anonymous: false,
        messages: [], // Chat messages received
      };
    },
    methods: {
      sendMessage() {
        fetch('http://localhost:3000/api/chat/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: this.content,
            sender: this.anonymous ? 'Anonymous' : 'Student', // Replace with dynamic name
            anonymous: this.anonymous,
          }),
        });
        this.content = '';
      },
      listenForChatToggle() {
        const eventSource = new EventSource('http://localhost:3000/api/chat/stream');
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'chat-toggle') {
            this.chatEnabled = data.enabled;
          } else if (data.type === 'new-message') {
            this.messages.push(data.message);
          }
        };
      },
    },
    created() {
      this.listenForChatToggle();
    },
  };
  </script>
  
  <style>
  .student-panel {
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
  