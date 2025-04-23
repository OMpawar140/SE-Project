<template>
    <div class="p-4">
      <h2 class="mb-4 text-center text-warning">My Sessions</h2>
      <div class="mb-3">
        <input
          v-model="search"
          type="text"
          placeholder="Filter sessions by topic..."
          class="form-control"
        />
      </div>
  
      <table class="table table-striped">
        <thead>
          <tr>

            <th>Status</th>
            <th>Date</th>
            <th>Topic</th>
            <th>Link</th>
            <th>Joining Key</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="session in filteredSessions" :key="session.session_id">
            <td>
              <span
                class="badge"
                :class="{
                  'bg-success': session.status === 'Active',
                  'bg-secondary': session.status === 'Closed'
                }"
              >
                {{ session.status }}
              </span>
            </td>
            <td>{{ new Date(session.date_time).toLocaleString() }}</td>
            <td>{{ session.topic }}</td>
            <td>
              <a :href="'http://localhost:5174/sessions/' + session.session_link" target="_blank">
                {{ session.session_link }}
              </a>
            </td>
            <td>
              {{ session.joining_key }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        sessions: [],
        search: '',
      };
    },
    computed: {
      filteredSessions() {
        return this.sessions.filter((session) =>
          session.topic.toLowerCase().includes(this.search.toLowerCase())
        );
      },
    },
    async mounted() {
      try {
        const res = await axios.get('http://localhost:5000/api/session/mysessions', {
          withCredentials: true,
        });
        this.sessions = res.data;
      } catch (error) {
        console.error('Error loading sessions:', error);
        alert('Failed to fetch sessions.');
      }
    },
  };
  </script>
  