<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-light ">
      <div class="container-fluid">
        <div class="d-flex justify-content-between align-items-center">
          <button class="btn btn-primary me-2">Code Directory</button>
          <button class="btn btn-secondary ">Chat</button>
           </div>
        <div class="d-flex align-items-center">
          <span class="me-3">👤 {{ authenticatedUser }}</span>
          <button @click="logout" class="btn btn-danger">Logout</button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="container mt-5">
      <div v-if="session">
        <div v-if="!session.authorized">
          <p class="text-danger">Session is not authorized. Redirecting...</p>
        </div>

        <div v-else-if="!sessionStarted">
          <h2 class="text-center mb-4">⏳ Session starts in:</h2>
          <div class="d-flex justify-content-center gap-3">
            <div class="timer-block"><h1>{{ timeRemaining.days }}</h1><small>Days</small></div>
            <div class="timer-block"><h1>{{ timeRemaining.hours }}</h1><small>Hours</small></div>
            <div class="timer-block"><h1>{{ timeRemaining.minutes }}</h1><small>Minutes</small></div>
            <div class="timer-block"><h1>{{ timeRemaining.seconds }}</h1><small>Seconds</small></div>
          </div>
          <div class="text-center mt-4">
            <h2>Topic - {{ session.topic }}</h2>
            <p>{{ session.topic_details }}</p>
          </div>
        </div>

        <div v-else>
          <div class="d-flex">
            <div class="flex-grow-1">
              <h1 class="text-success">🎉 Session Started!</h1>
              <h2>Topic - {{ session.topic }}</h2>
              <p>{{ session.topic_details }}</p>
            </div>
            <div class="border-start ps-4 ms-4" style="min-width: 250px;">
              <h4 class="mb-3">👥 Registered Members</h4>
              <ul class="list-group">
                <li class="list-group-item" v-for="(user, idx) in registeredUsers" :key="idx">
                  {{ user.email }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center mt-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">Loading session data...</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      session_link: this.$route.params.session_link,
      session: null,
      session_id: null,
      timeRemaining: {
        days: '00',
        hours: '00',
        minutes: '00',
        seconds: '00',
        total: 0,
      },
      sessionStarted: false,
      registeredUsers: [],
      authenticatedUser: '',
      intervalId: null,
    };
  },

  async mounted() {
    const isAuthenticated = await this.checkAuth();
    if (!isAuthenticated) {
      return this.$router.push(`/sessions/${this.session_link}`);
    }

    const sessionId = await this.fetchSessionIdByLink();
    if (!sessionId) {
      this.$router.push(`/sessions/${this.session_link}`);
      return;
    }

    await this.fetchSessionDetails(sessionId);
    if (!this.session || !this.session.authorized) {
      return this.$router.push(`/sessions/${this.session_link}`);
    }

    const sessionTime = new Date(this.session.date_time);
    const now = new Date();

    if (now < sessionTime) {
      this.startCountdown(sessionTime);
    } else {
      this.sessionStarted = true;
      this.fetchRegisteredUsers(sessionId);
    }
  },

  beforeUnmount() {
    clearInterval(this.intervalId);
  },

  methods: {
    async checkAuth() {
      try {
        const res = await axios.get('http://localhost:3000/api/protected/dashboard', { withCredentials: true });
        this.authenticatedUser = res.data.message; // Assuming the API returns `user_name`
        return true;
      } catch (err) {
        return false;
      }
    },

    async fetchSessionIdByLink() {
      try {
        const res = await axios.get(`http://localhost:3000/api/sessionlink/public/${this.session_link}`);
        this.session_id = res.data.session_id;
        return res.data.session_id;
      } catch (err) {
        console.error('Failed to fetch session_id from session_link:', err);
        return null;
      }
    },

    async fetchSessionDetails(sessionId) {
      try {
        const res = await axios.get(`http://localhost:3000/api/session/id/${sessionId}`);
        this.session = res.data;
      } catch (err) {
        console.error('Failed to fetch session:', err);
      }
    },

    async fetchRegisteredUsers(sessionId) {
      try {
        const res = await axios.get(`http://localhost:3000/api/session/${sessionId}/registered-users`);
        this.registeredUsers = res.data;
      } catch (err) {
        console.error('Failed to fetch registered users:', err);
      }
    },

    startCountdown(sessionDate) {
      this.updateTimer(sessionDate);
      this.intervalId = setInterval(() => {
        this.updateTimer(sessionDate);
      }, 1000);
    },

    updateTimer(sessionDate) {
      const now = new Date().getTime();
      const target = new Date(sessionDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        clearInterval(this.intervalId);
        this.sessionStarted = true;
        this.fetchRegisteredUsers(this.session_id);
        return;
      }

      const total = Math.floor(diff / 1000);
      const days = Math.floor(total / (3600 * 24));
      const hours = Math.floor((total % (3600 * 24)) / 3600);
      const minutes = Math.floor((total % 3600) / 60);
      const seconds = total % 60;

      this.timeRemaining = {
        total,
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
      };
    },

    async logout() {
      try {
        await axios.post('http://localhost:3000/api/student/logout', {}, { withCredentials: true });
        alert('Logged out successfully!');
        this.$router.push('/sessions/' + this.session_link);
      } catch (err) {
        console.error('Logout failed:', err);
      }
    },
  },
};
</script>

<style scoped>
.timer-block {
  background-color: black;
  color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  width: 80px;
  text-align: center;
}
</style>