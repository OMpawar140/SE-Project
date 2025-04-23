<template>
  <div class="chat-app">
    <div class="background-gradient"></div>
    <h1 class="text-center app-title">Real-Time Chat</h1>
    <div v-if="!role" class="role-selection-container">
      <h2 class="text-center">Are you a Teacher or Student?</h2>
      <div class="role-selection text-center">
        <button @click="setRole('teacher')" class="btn btn-primary">Teacher</button>
        <button @click="setRole('student')" class="btn btn-secondary">Student</button>
      </div>
    </div>
    <div v-else class="chat-container">
      <!-- Chat Panel -->
      <div class="chat-panel">
        <div v-if="role === 'teacher'" class="teacher-panel">
          <h2>Teacher Panel</h2>
          <label class="chat-toggle">
            <input type="checkbox" v-model="chatEnabled" @change="toggleChat" />
            Enable Chat
          </label>
        </div>
        <div v-if="role === 'student'" class="student-panel">
          <h2>Student Panel</h2>
          <p>Chat is <strong>{{ chatEnabled ? "Enabled" : "Disabled" }}</strong></p>
        </div>

        <!-- Teacher Chat Window -->
        <div v-if="role === 'teacher'" class="chat-window" ref="chatWindow">
          <h3>Messages</h3>
          <div v-for="message in sanitizedMessages" :key="message.id" class="message">
            <p>
              <strong>{{ message.anonymous ? "Anonymous" : message.sender }}</strong>:
              <span v-html="message.content"></span>
              <span v-if="message.anonymous && role === 'teacher'" class="text-muted">
                (User: {{ message.sender }})
              </span>
            </p>
          </div>
        </div>

        <!-- Student Chat Window -->
        <div v-if="role === 'student'" class="chat-window" ref="chatWindow">
          <h3>Messages</h3>
          <div v-for="message in sanitizedMessages" :key="message.id" class="message">
            <p>
              <strong>{{ message.anonymous ? "Anonymous" : message.sender.includes("Anonymous") ? "Anonymous" : message.sender }}</strong>:
              <span v-html="message.content"></span>
            </p>
          </div>
        </div>

        <!-- New Message Notification -->
        <div v-if="newMessageCount > 0" class="new-message-notification" @click="scrollToBottom">
          {{ newMessageCount }} new message(s)
        </div>

        <!-- Chat Input -->
        <div class="chat-input">
          <form @submit.prevent="sendMessage">
            <div v-if="role === 'student'">
              <input v-model="studentName" type="text" placeholder="Enter your name" required />
              <br />
              <label>
                <input type="checkbox" v-model="anonymous" /> Send as Anonymous
              </label>
              <br />
            </div>
            <RichTextEditor @update-content="updateMessageContent" ref="richTextEditor" />
            <br />
            <button type="submit" class="btn btn-primary">Send</button>
          </form>
        </div>
      </div>

      <!-- Active Users List -->
      <div class="active-users">
        <h3>Active Users</h3>
        <ul>
          <li v-for="user in activeUsers" :key="user">{{ user }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import RichTextEditor from "./components/RichTextEditor.vue";
import DOMPurify from "dompurify";

export default {
  components: {
    RichTextEditor,
  },
  data() {
    return {
      role: null,
      chatEnabled: false,
      studentName: "",
      content: "",
      anonymous: false,
      messages: [],
      activeUsers: [],
      newMessageCount: 0,
    };
  },
  computed: {
    sanitizedMessages() {
      return this.messages.map((msg) => ({
        ...msg,
        content: DOMPurify.sanitize(msg.content),
      }));
    },
  },
  methods: {
    setRole(role) {
      this.role = role;
      if (role === "student") {
        this.chatEnabled = JSON.parse(localStorage.getItem("chatEnabled")) || false;
      }
    },
    toggleChat() {
      fetch("http://localhost:3000/api/chat/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: this.chatEnabled }),
      });
      localStorage.setItem("chatEnabled", JSON.stringify(this.chatEnabled));
    },
    updateMessageContent(content) {
      this.content = content;
    },
    sendMessage() {
      if (!this.content.trim()) {
        alert("Message content cannot be empty.");
        return;
      }

      const senderName = this.role === "teacher" ? "Teacher" : this.anonymous ? this.studentName : this.studentName || "Student";
      const messageData = {
        content: this.content,
        sender: senderName,
        anonymous: this.anonymous,
      };

      fetch("http://localhost:3000/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });

      this.$refs.richTextEditor.clearEditor();
      this.content = "";
    },
    listenForMessages() {
      const eventSource = new EventSource("http://localhost:3000/api/chat/stream");
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "chat-toggle") {
          this.chatEnabled = data.enabled;
        } else if (data.type === "new-message") {
          this.messages.push(data.message);
          if (this.$refs.chatWindow.scrollTop + this.$refs.chatWindow.clientHeight >= this.$refs.chatWindow.scrollHeight) {
            this.scrollToBottom();
          } else {
            this.newMessageCount++;
          }
          if (!this.activeUsers.includes(data.message.sender) && !data.message.sender.includes("Anonymous")) {
            this.addActiveUser(data.message.sender); // Use addActiveUser
          }
        }
      };
    },
    scrollToBottom() {
      this.$refs.chatWindow.scrollTop = this.$refs.chatWindow.scrollHeight;
      this.newMessageCount = 0;
    },
    addActiveUser(user) {
      // Check if the user already exists, to prevent duplicates
      if (!this.activeUsers.includes(user)) {
        this.activeUsers.push(user);
        this.saveActiveUsers(); // Save to localStorage
      }
    },
    removeActiveUser(user) {
       this.activeUsers = this.activeUsers.filter(u => u !== user);
       this.saveActiveUsers();
    },
    saveActiveUsers() {
      localStorage.setItem("activeUsers", JSON.stringify(this.activeUsers));
    },
    loadActiveUsers() {
      const savedUsers = localStorage.getItem("activeUsers");
      if (savedUsers) {
        this.activeUsers = JSON.parse(savedUsers);
      }
    },
  },
  created() {
    const savedChatStatus = localStorage.getItem("chatEnabled");
    if (savedChatStatus !== null) {
      this.chatEnabled = JSON.parse(savedChatStatus);
    }
    this.loadActiveUsers(); // Load active users from localStorage
    this.listenForMessages();
  },
  beforeUnmount() {
    // Optional: Remove the user when they leave (e.g., closing the tab)
    // Get the user's name, assuming studentName is set during login
    const userName = this.role === 'teacher' ? 'Teacher' : this.studentName || 'Student';
    if (userName && !userName.includes("Anonymous")) {
      this.removeActiveUser(userName);
    }
  }
};
</script>

<style>
.chat-app {
  position: relative;
  padding: 20px;
  font-family: Arial, sans-serif;
  color: #fff;
  min-height: 100vh;
  overflow: hidden;
}

.background-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(120deg, #1e3c72, #2a5298, #1e3c72, #2a5298);
  background-size: 400% 400%;
  animation: gradientAnimation 10s infinite ease-in-out;
  z-index: -1;
}

@keyframes gradientAnimation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.text-center {
  text-align: center;
}

.role-selection-container {
  margin-top: 20px;
}

.role-selection button {
  margin: 10px;
  padding: 10px 20px;
  background-color: #6200ea;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s;
}

.role-selection button:hover {
  transform: scale(1.1);
}

.chat-container {
  display: flex;
  flex-direction: row;
  height: calc(100vh - 100px);
  justify-content: space-between;
}

.chat-panel {
  flex: 3;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.5);
  margin-right: 20px;
}

.active-users {
  width: 200px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 12px;
}

.active-users ul {
  list-style: none;
  padding: 0;
}

.active-users li {
  margin: 10px 0;
}

.chat-window {
  flex: 1;
  overflow-y: auto;
  margin-top: 20px;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
}

.message {
  padding: 5px 0;
}

.new-message-notification {
  background: #ffeb3b;
  color: #000;
  padding: 10px;
  text-align: center;
  cursor: pointer;
  border-radius: 8px;
  margin-top: 10px;
}

.chat-input {
  margin-top: 20px;
}

.btn-primary {
  background-color: #4caf50;
}

.btn-secondary {
  background-color: #2196f3;
}
</style>