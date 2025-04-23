import axios from 'axios';


export default {
  async signup(userData) {
    const response = await axios.post(`${import.meta.env.VITE_API_BACKEND_URL}/api/auth/signup`, userData, { withCredentials: true });
    return response.data;
  },
  async verifyOtp(otpData) {
    const response = await axios.post(`${import.meta.env.VITE_API_BACKEND_URL}/api/auth/verify-otp`, otpData, { withCredentials: true });
    return response.data;
  },
  async getDashboard() {
    const response = await axios.get(`${import.meta.env.VITE_API_BACKEND_URL}/api/protected/dashboard`, { withCredentials: true });
    return response.data;
  }
};
