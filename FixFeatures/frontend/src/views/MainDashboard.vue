<template>
  <div class="d-flex">
    <Sidebar :collapsed="collapsed" @toggleCollapse="collapsed = !collapsed" @navigate="activeView = $event" @logout="handleLogout" />
    
    <div class="flex-grow-1 p-4">
      <component
        :is="getComponent"
        :user="user"
        @logout="handleLogout"
        @refreshSessions="activeView = 'mysessions'"
      />
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Sidebar from "../components/Sidebar.vue";
import CreateSession from "./CreateSession.vue";
import MySessions from "./MySessions.vue";
import Dashboard from "./Dashboard.vue"; 

export default {
  components: {
    Sidebar,
    CreateSession,
    MySessions,
    Dashboard,
  },
  data() {
    return {
      user: null,
      collapsed: false,
      activeView: "dashboard",
    };
  },
  computed: {
    getComponent() {
      switch (this.activeView) {
        case "createsession":
          return CreateSession;
        case "mysessions":
          return MySessions;
        default:
          return Dashboard;
      }
    }
  },
  async mounted() {
    try {
      const response = await axios.get("http://localhost:5000/api/protected/dashboard", {
        withCredentials: true,
      });
      this.user = response.data.message;
    } catch (error) {
      console.error("Unauthorized:", error);
      alert("Unauthorized. Redirecting to login.");
      this.$router.push("/login");
    }
  },
  methods: {
    async handleLogout() {
      try {
        await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });
        alert("Logged out");
        this.$router.push("/login");
      } catch (error) {
        console.error("Logout failed:", error);
        alert("Logout failed. Try again.");
      }
    },
  },
};
</script>
