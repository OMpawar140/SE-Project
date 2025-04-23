import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import SignupView from '../views/SignupView.vue';
import Sessions from '../views/Sessions.vue';
import SessionJoined from '../views/SessionJoined.vue';
const routes = [
  { path: '/login', component: LoginView },
  { path: '/signup', component: SignupView }, 
  { path: '/sessions/:session_link', component: Sessions , props: true },
  { path: '/session-joined/:session_link', component: SessionJoined , props: true },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;