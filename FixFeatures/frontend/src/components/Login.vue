<template>
  <div class="container d-flex justify-content-center align-items-center vh-100">
    <div class="card p-4 shadow-lg" style="background-color: #333; color: #fff; width: 400px;">
      <h2 class="text-center">Login</h2>

      <form v-if="!otpSent" @submit.prevent="handleLogin">
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input type="email" class="form-control" v-model="email" required>
        </div>
        <div class="mb-3 position-relative">
          <label class="form-label">Password</label>
          <input type="password" class="form-control" v-model="password" required>
        </div>
        <button type="submit" class="btn btn-dark w-100">Login</button>
      </form>

      <form v-if="otpSent" @submit.prevent="verifyOtp">
      <div class="mb-3">
        <label class="form-label">Enter OTP</label>
        <input type="text" class="form-control" v-model="otp" required>
      </div>
      <button type="submit" class="btn btn-warning w-100">Verify OTP</button>

      <p class="text-center mt-2">
        Didn't receive the OTP? 
        <a href="#" @click.prevent="resendOtp" v-if="!resendDisabled" class="text-warning">Resend OTP</a>
        <span v-else class="text-muted">Resend available in {{ resendTimer }}s</span>
      </p>
    </form>


    <p class="text-center mt-3">
    Don't have an account? <router-link to="/signup" class="text-warning">Sign Up</router-link>
  </p>

    </div>
  </div>
</template>

<script>
import axios from "axios";
import { RouterLink } from 'vue-router';

export default {
  data() {
    return {
      email: '',
      password: '',
      otp: '',
      otpSent: false,
      resendTimer: 120, 
      resendDisabled: true
    };
  },
  async mounted() {
    try {
      const response = await axios.get(`http://localhost:5000/api/protected/dashboard`, { withCredentials: true });
      if (response.data) {
        this.$router.push('/dashboard');
        console.log(response.data);
      }
    } catch (error) {
      console.log('User is not authenticated, stay on login page.');
    }
  },
  methods: {
    async handleLogin() {
      try {
        const response = await axios.post(`http://localhost:5000/api/auth/login`, {
          email: this.email,
          password: this.password
        }, { withCredentials: true });

        alert(response.data.message);
        this.otpSent = true;
        this.startResendTimer();
      } catch (error) {
        alert(error.response.data.message);
      }
    },
    async verifyOtp() {
      try {
        const response = await axios.post(`http://localhost:5000/api/auth/verify-otp`, {
          email: this.email,
          otp: this.otp
        }, { withCredentials: true });

        alert(response.data.message);
        this.$router.push('/dashboard');
      } catch (error) {
        alert(error.response.data.message);
      }
    },

    async resendOtp() {
  try {
    const response = await axios.post(`http://localhost:5000/api/auth/resend-otp`, {
      email: this.email
    }, { withCredentials: true });

    alert(response.data.message);
    this.startResendTimer();
  } catch (error) {
    console.error('Resend OTP Error:', error);
    alert(error.response?.data?.message || 'An error occurred while resending OTP.');
  }
},


    startResendTimer() {
      this.resendDisabled = true;
      this.resendTimer = 120;

      const interval = setInterval(() => {
        if (this.resendTimer > 0) {
          this.resendTimer--;
        } else {
          this.resendDisabled = false;
          clearInterval(interval);
        }
      }, 1000);
    }
  }
};
</script>