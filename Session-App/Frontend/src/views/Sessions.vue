<template>
    <div class="container mt-5">
      <div v-if="session">
        <!-- JOIN FORM -->
        <div v-if="!showCountdownStarted" class="text-center">
          <h2>Topic - {{ session.topic }}</h2>
          <p>Description - {{ session.topic_details }}</p>
  
          <form @submit.prevent="checkUser" class="mt-4">
            <div class="form-group mb-3">
              <input v-model="email" type="email" class="form-control" placeholder="Enter your email" required />
            </div>
            <div class="form-group mb-3">
              <input v-model="joiningKey" type="text" class="form-control" placeholder="Enter Joining Key" required />
            </div>
            <button type="submit" class="btn btn-primary">Join Session</button>
          </form>
  
          <p class="mt-3 text-success" v-if="checkResult">{{ checkResult }}</p>
          <p class="mt-3 text-info" v-if="registerMessage">{{ registerMessage }}</p>
        </div>
  
        <!-- COUNTDOWN TIMER UI -->
        <div v-else-if="timeRemaining.total > 0" class="d-flex justify-content-center align-items-center vh-20 flex-column">
          <h2 class="mb-4">⏳ Session starting in</h2>
          <div class="d-flex justify-content-center gap-3">
            <div class="timer-block">
              <h1 class="mb-0">{{ timeRemaining.days }}</h1>
              <small>Days</small>
            </div>
            <div class="timer-block">
              <h1 class="mb-0">{{ timeRemaining.hours }}</h1>
              <small>Hours</small>
            </div>
            <div class="timer-block">
              <h1 class="mb-0">{{ timeRemaining.minutes }}</h1>
              <small>Minutes</small>
            </div>
            <div class="timer-block">
              <h1 class="mb-0">{{ timeRemaining.seconds }}</h1>
              <small>Seconds</small>
            </div>
          </div>
          <div class="text-center mt-4">
            <h2>Topic - {{ session.topic }}</h2>
            <p>Description - {{ session.topic_details }}</p>
  
            <form @submit.prevent="checkUser" class="mt-4">
              <div class="form-group mb-3">
                <input v-model="email" type="email" class="form-control" placeholder="Enter your email" required />
              </div>
              <div class="form-group mb-3">
                <input v-model="joiningKey" type="text" class="form-control" placeholder="Enter Joining Key" required />
              </div>
              <button type="submit" class="btn btn-primary">Join Session</button>
            </form>
        </div>
        </div>
  
        <!-- SESSION STARTED -->
        <div v-else class="d-flex justify-content-center align-items-center vh-20">
          <div class="text-center">
            <h1 class="text-success display-4">🎉 Session Started!</h1>
            <h2>Topic - {{ session.topic }}</h2>
            <p>Description - {{ session.topic_details }}</p>
  
            <form @submit.prevent="checkUser" class="mt-4">
              <div class="form-group mb-3">
                <input v-model="email" type="email" class="form-control" placeholder="Enter your email" required />
              </div>
              <div class="form-group mb-3">
                <input v-model="joiningKey" type="text" class="form-control" placeholder="Enter Joining Key" required />
              </div>
              <button type="submit" class="btn btn-primary">Join Session</button>
            </form>
          </div>
        </div>
      </div>
  
      <!-- LOADER -->
      <div v-else class="text-center mt-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">Loading or Invalid session...</p>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        session: null,
        session_link: this.$route.params.session_link,
        email: '',
        joiningKey: '',
        checkResult: '',
        registerMessage: '',
        showCountdownStarted: false,
        timeRemaining: {
          days: '00',
          hours: '00',
          minutes: '00',
          seconds: '00',
          total: 0,
        },
        intervalId: null,
      };
    },
  
    mounted() {
      this.fetchSessionDetails();
    },
  
    beforeUnmount() {
      clearInterval(this.intervalId);
    },

 
  
  mounted() {
    this.fetchSessionDetails();
    this.checkAuthentication();
  },

  methods: 
  {   
    async checkAuthentication() {
      try {
        const response = await axios.get(`http://localhost:3000/api/protected/dashboard`, { withCredentials: true });
        if (response.data) {
          this.$router.push(`/session-joined/${this.session_link}`);
          console.log(response.data);
        }
      } catch (error) {
        console.log('User is not authenticated, stay on login page.');
      }
    },
      async fetchSessionDetails() {
        try {
          const res = await axios.get(`http://localhost:3000/api/sessionlink/public/${this.session_link}`);
          this.session = res.data;
          const sessionDate = new Date(this.session.date_time);
          const now = new Date();
  
          this.showCountdownStarted = true;
          if (sessionDate > now) {
            this.startCountdown(sessionDate);
          }
        } catch (err) {
          console.error('Session fetch error:', err);
          this.session = null;
        }
      },


  
      async checkUser() {
        try {
          const res = await axios.post('http://localhost:3000/api/student/check-user', {
            email: this.email,
            joiningKey: this.joiningKey,
            session_link: this.session_link,
          });
  
          this.checkResult = res.data.exists;
  
          if (res.data.exists === 'user exists') {
            await this.registerToSession();
            this.$router.push({
              path: '/login',
              query: { email: this.email, session_link: this.session_link },
            });
          } else {
            this.$router.push({
              path: '/signup',
              query: { email: this.email, session_link: this.session_link },
            });
          }
        } catch (err) {
          this.checkResult = err.response?.data?.error || 'Check failed';
        }
      },
  
      async registerToSession() {
        try {
          const res = await axios.post(
            'http://localhost:3000/api/student/register-to-session',
            {
              email: this.email,
              session_link: this.session_link,
              joining_key: this.joiningKey,
            },
            { withCredentials: true }
          );
          this.registerMessage = res.data.message;
        } catch (err) {
          this.registerMessage = err.response?.data?.message || 'Registration failed';
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
          this.timeRemaining.total = 0;
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
    },
  };
  </script>
  
  <style scoped>
  .vh-50 {
    height: 50vh;
  }
  
  .timer-block {
    background-color: black;
    color: white;
    padding: 1rem;
    border-radius: 0.5rem;
    width: 80px;
    text-align: center;
  }
  </style>
  