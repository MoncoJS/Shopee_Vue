<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">User Management</h1>

    <!-- Search Input -->
    <div class="mb-4">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search users..."
        class="input input-bordered w-full max-w-xs"
      />
    </div>

    <!-- Users Table -->
    <div class="overflow-x-auto">
      <table class="table w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>
              <button class="btn btn-sm btn-outline btn-info mr-2">Edit</button>
              <button class="btn btn-sm btn-outline btn-error">Delete</button>
            </td>
          </tr>
          <tr v-if="filteredUsers.length === 0">
            <td colspan="5" class="text-center">No users found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import UserService from '../services/UserService';

export default {
  name: 'UserManagement',
  data() {
    return {
      searchQuery: '',
      users: []
    };
  },
  computed: {
    filteredUsers() {
      if (!this.searchQuery) {
        return this.users;
      }
      const lowerCaseQuery = this.searchQuery.toLowerCase();
      return this.users.filter(user =>
        user.username.toLowerCase().includes(lowerCaseQuery) ||
        user.email.toLowerCase().includes(lowerCaseQuery)
      );
    }
  },
  methods: {
    fetchUsers() {
      UserService.getUsers()
        .then(response => {
          this.users = response.data.data;
        })
        .catch(() => {
          // console.error('Error fetching users:', error);
        });
    }
  },
  created() {
    this.fetchUsers();
  }
};
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
