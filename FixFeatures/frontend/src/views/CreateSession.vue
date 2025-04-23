<template>
    <form @submit.prevent="createSession" class="mt-4">
      <h3>Create a New Session</h3>
      <div class="form-group mb-2">
        <input v-model="form.topic" type="text" class="form-control" placeholder="Session Topic" required />
      </div>
      <div class="form-group mb-2">
        <textarea v-model="form.topic_details" class="form-control" placeholder="Topic Details (optional)" rows="3"></textarea>
      </div>
      <div class="form-group mb-3">
        <input v-model="form.date_time" type="datetime-local" class="form-control" required />
      </div>
      <button type="submit" class="btn btn-success w-100 mb-2">Create Session</button>
    </form>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        form: {
          topic: "",
          topic_details: "",
          date_time: "",
        },
      };
    },
    methods: {
      async createSession() {
        try {
          await axios.post("http://localhost:5000/api/session/create", this.form, {
            withCredentials: true,
          });
          alert("Session Created Successfully!");
          this.form = { topic: "", topic_details: "", date_time: "" };
          this.$emit("refreshSessions");
        } catch (error) {
          console.error("Error creating session:", error);
          alert("Failed to create session.");
        }
      },
    },
  };
  </script>
  