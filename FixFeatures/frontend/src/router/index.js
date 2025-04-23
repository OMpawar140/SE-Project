import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import SignupView from '../views/SignupView.vue';
import Dashboard from '../views/MainDashboard.vue'
import MySessions from '../views/MySessions.vue';
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView },
  { path: '/signup', component: SignupView },
  { path: '/dashboard', component: Dashboard },
  { path: '/mysessions',component: MySessions}  
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;