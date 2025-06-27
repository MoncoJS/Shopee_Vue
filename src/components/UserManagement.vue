<template>
  <div class="user-management-container">
    <div class="user-management-card">
      <div class="user-management-header">
        <h1 class="user-management-title">การจัดการผู้ใช้</h1>
      </div>

      <div class="action-bar">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="ค้นหาผู้ใช้..."
          class="search-input"
        />
        <button @click="openDialogForCreate" class="btn-add-user">
          เพิ่มผู้ใช้ใหม่
        </button>
      </div>

      <div class="user-table-wrapper">
        <table class="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>ชื่อผู้ใช้</th>
              <th>อีเมล</th>
              <th>บทบาท</th>
              <th>การกระทำ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user._id">
              <td>{{ user._id }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.role }}</td>
              <td>
                <button @click="openDialogForEdit(user)" class="btn-action btn-edit">แก้ไข</button>
                <button @click="deleteUser(user._id)" class="btn-action btn-delete">ลบ</button>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="5" class="no-users-found">ไม่พบผู้ใช้</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- User Edit/Add Dialog -->
      <div v-if="showDialog" class="dialog-backdrop">
        <div class="dialog">
          <h3 class="dialog-title">{{ isEditMode ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้ใหม่' }}</h3>
          <form @submit.prevent="saveUser" class="dialog-form-grid">
            <div class="form-group">
              <label class="form-label">ชื่อผู้ใช้</label>
              <input v-model="editUser.username" type="text" required class="input-bordered" :disabled="isEditMode" />
            </div>
            <div class="form-group">
              <label class="form-label">อีเมล</label>
              <input v-model="editUser.email" type="email" required class="input-bordered" />
            </div>
            <div class="form-group">
              <label class="form-label">รหัสผ่าน (เว้นว่างหากไม่ต้องการเปลี่ยน)</label>
              <input v-model="editUser.password" type="password" class="input-bordered" />
            </div>
            <div class="form-group">
              <label class="form-label">บทบาท</label>
              <select v-model="editUser.role" class="input-bordered">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="dialog-actions">
              <button type="button" class="btn-secondary" @click="showDialog = false">ยกเลิก</button>
              <button type="submit" class="btn-gradient">บันทึก</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import '@/styles/user-management.css';
import api from '@/services/api';

export default {
  name: 'UserManagement',
  data() {
    return {
      searchQuery: '',
      users: [],
      showDialog: false,
      isEditMode: false,
      editUser: {
        _id: null,
        username: '',
        email: '',
        password: '',
        role: 'user',
      },
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
    async fetchUsers() {
      try {
        const response = await api.get('/users');
        this.users = response.data.data;
      } catch (error) {
        console.error('Error fetching users:', error);
        alert('Failed to fetch users.');
      }
    },
    openDialogForCreate() {
      this.isEditMode = false;
      this.editUser = {
        _id: null,
        username: '',
        email: '',
        password: '',
        role: 'user',
      };
      this.showDialog = true;
    },
    openDialogForEdit(user) {
      this.isEditMode = true;
      this.editUser = { ...user, password: '' }; // Clear password for security
      this.showDialog = true;
    },
    async saveUser() {
      try {
        if (this.isEditMode) {
          // Update user
          const payload = { ...this.editUser };
          if (!payload.password) {
            delete payload.password; // Don't send empty password
          }
          await api.put(`/users/${payload._id}`, payload);
          alert('User updated successfully!');
        } else {
          // Create user
          await api.post('/users', this.editUser);
          alert('User created successfully!');
        }
        this.showDialog = false;
        this.fetchUsers(); // Refresh list
      } catch (error) {
        console.error('Error saving user:', error);
        alert(error.response?.data?.message || 'Failed to save user.');
      }
    },
    async deleteUser(id) {
      if (confirm('Are you sure you want to delete this user?')) {
        try {
          await api.delete(`/users/${id}`);
          alert('User deleted successfully!');
          this.fetchUsers(); // Refresh list
        } catch (error) {
          console.error('Error deleting user:', error);
          alert(error.response?.data?.message || 'Failed to delete user.');
        }
      }
    },
  },
  created() {
    this.fetchUsers();
  }
};
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
