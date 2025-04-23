import { ref } from 'vue';
import AuthService from '../services/AuthService';
import { useRouter } from 'vue-router';

export function useAuth() {
  const name = ref('');
  const email = ref('');
  const password = ref('');
  const otp = ref('');
  const otpSent = ref(false);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const response = await AuthService.getDashboard();
      if (response) router.push('/dashboard');
    } catch {
      console.log('User not authenticated.');
    }
  };

  const handleSignup = async () => {
    try {
      const response = await AuthService.signup({ name: name.value, email: email.value, password: password.value });
      alert(response.message);
      otpSent.value = true;
    } catch (error) {
      alert(error.message);
    }
  };

  const verifyOtp = async () => {
    try {
      const response = await AuthService.verifyOtp({ email: email.value, otp: otp.value });
      alert(response.message);
      router.push('/dashboard');
    } catch (error) {
      alert(error.message);
    }
  };

  return { name, email, password, otp, otpSent, handleSignup, verifyOtp, checkAuth };
}
