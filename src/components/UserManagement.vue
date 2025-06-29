<template>
  <div class="user-management">
    <div class="header">
      <h2>จัดการผู้ใช้งาน</h2>
      <div class="header-actions">
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            placeholder="ค้นหาผู้ใช้..."
            class="search-input"
          />
          <svg class="search-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </div>
        <select v-model="roleFilter" class="role-filter">
          <option value="">ทุกสิทธิ์</option>
          <option value="user">ผู้ใช้ทั่วไป</option>
          <option value="admin">ผู้ดูแลระบบ</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>กำลังโหลดข้อมูลผู้ใช้...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>เกิดข้อผิดพลาด</h3>
      <p>{{ error }}</p>
      <button @click="fetchUsers" class="retry-btn">ลองใหม่อีกครั้ง</button>
    </div>

    <!-- Users Table -->
    <div v-else class="users-table-container">
      <div class="users-stats">
        <div class="stat-card">
          <div class="stat-number">{{ filteredUsers.length }}</div>
          <div class="stat-label">ผู้ใช้ทั้งหมด</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ adminCount }}</div>
          <div class="stat-label">ผู้ดูแลระบบ</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ userCount }}</div>
          <div class="stat-label">ผู้ใช้ทั่วไป</div>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="users-table">
          <thead>
            <tr>
              <th>ผู้ใช้</th>
              <th>อีเมล</th>
              <th>สิทธิ์</th>
              <th>วันที่สมัคร</th>
              <th>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in paginatedUsers" :key="user._id" class="user-row">
              <td class="user-info">
                <div class="user-avatar">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <div class="user-details">
                  <div class="user-name">
                    {{ user.firstName || user.lastName 
                      ? `${user.firstName || ''} ${user.lastName || ''}`.trim() 
                      : user.username 
                    }}
                  </div>
                  <div class="user-username">@{{ user.username }}</div>
                </div>
              </td>
              <td class="user-email">{{ user.email }}</td>
              <td class="user-role">
                <span class="role-badge" :class="user.role">
                  <svg v-if="user.role === 'admin'" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  {{ user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป' }}
                </span>
              </td>
              <td class="user-date">{{ formatDate(user.createdAt) }}</td>
              <td class="user-actions">
                <button 
                  v-if="user.role !== 'admin' || user._id !== currentUser._id"
                  @click="toggleUserRole(user)"
                  :disabled="updatingUser === user._id"
                  class="action-btn toggle-role"
                  :title="user.role === 'admin' ? 'เปลี่ยนเป็นผู้ใช้ทั่วไป' : 'เปลี่ยนเป็นผู้ดูแลระบบ'"
                >
                  <svg v-if="updatingUser === user._id" class="loading-icon" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.3"/>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <svg v-else-if="user.role === 'admin'" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                  </svg>
                </button>
                <span v-else class="disabled-action">
                  ไม่สามารถแก้ไขได้
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="currentPage = 1" 
          :disabled="currentPage === 1"
          class="page-btn"
        >
          ««
        </button>
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="page-btn"
        >
          ‹
        </button>
        <span class="page-info">
          หน้า {{ currentPage }} จาก {{ totalPages }}
        </span>
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          ›
        </button>
        <button 
          @click="currentPage = totalPages" 
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          »»
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api.js'
import { mapGetters } from 'vuex'

export default {
  name: 'UserManagement',
  data() {
    return {
      users: [],
      loading: false,
      error: null,
      searchQuery: '',
      roleFilter: '',
      currentPage: 1,
      usersPerPage: 10,
      updatingUser: null
    }
  },
  computed: {
    ...mapGetters(['getUser']),
    currentUser() {
      return this.getUser
    },
    filteredUsers() {
      let filtered = this.users
      
      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(user => 
          user.username.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          (user.firstName && user.firstName.toLowerCase().includes(query)) ||
          (user.lastName && user.lastName.toLowerCase().includes(query))
        )
      }
      
      // Role filter
      if (this.roleFilter) {
        filtered = filtered.filter(user => user.role === this.roleFilter)
      }
      
      return filtered
    },
    paginatedUsers() {
      const start = (this.currentPage - 1) * this.usersPerPage
      const end = start + this.usersPerPage
      return this.filteredUsers.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredUsers.length / this.usersPerPage)
    },
    adminCount() {
      return this.users.filter(user => user.role === 'admin').length
    },
    userCount() {
      return this.users.filter(user => user.role === 'user').length
    }
  },
  watch: {
    filteredUsers() {
      // Reset to first page when filter changes
      this.currentPage = 1
    }
  },
  async created() {
    await this.fetchUsers()
  },
  methods: {
    async fetchUsers() {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.get('/users/')
        if (response.data.success) {
          this.users = response.data.data || []
        } else {
          this.error = 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้'
        }
      } catch (error) {
        console.error('Error fetching users:', error)
        this.error = 'เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้'
      } finally {
        this.loading = false
      }
    },
    
    async toggleUserRole(user) {
      if (this.updatingUser === user._id) return
      
      const newRole = user.role === 'admin' ? 'user' : 'admin'
      const confirmMessage = user.role === 'admin' 
        ? `คุณต้องการเปลี่ยน "${user.username}" จากผู้ดูแลระบบเป็นผู้ใช้ทั่วไปหรือไม่?`
        : `คุณต้องการเปลี่ยน "${user.username}" จากผู้ใช้ทั่วไปเป็นผู้ดูแลระบบหรือไม่?`
      
      if (!confirm(confirmMessage)) return
      
      this.updatingUser = user._id
      
      try {
        const response = await api.put(`/users/${user._id}/role`, {
          role: newRole
        })
        
        if (response.data.success) {
          // Update user in local array
          const userIndex = this.users.findIndex(u => u._id === user._id)
          if (userIndex !== -1) {
            this.users[userIndex].role = newRole
          }
          
          this.$notify.success(`เปลี่ยนสิทธิ์ของ ${user.username} เรียบร้อยแล้ว`)
        } else {
          throw new Error(response.data.message || 'ไม่สามารถเปลี่ยนสิทธิ์ได้')
        }
      } catch (error) {
        console.error('Error updating user role:', error)
        this.$notify.error('เกิดข้อผิดพลาดในการเปลี่ยนสิทธิ์ผู้ใช้')
      } finally {
        this.updatingUser = null
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.user-management {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header h2 {
  color: #2d3748;
  font-size: 1.875rem;
  font-weight: 700;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-box {
  position: relative;
}

.search-input {
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  width: 250px;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #ee4d2d;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #a0aec0;
}

.role-filter {
  padding: 0.5rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
}

.role-filter:focus {
  outline: none;
  border-color: #ee4d2d;
}

.loading-state, .error-state {
  text-align: center;
  padding: 3rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #ee4d2d;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-btn {
  background: #ee4d2d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 1rem;
  transition: background 0.3s ease;
}

.retry-btn:hover {
  background: #dc2626;
}

.users-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #ee4d2d;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
}

.table-wrapper {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  background: #f8fafc;
  color: #374151;
  font-weight: 600;
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.875rem;
}

.user-row {
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.2s ease;
}

.user-row:hover {
  background: #f8fafc;
}

.users-table td {
  padding: 1rem;
  vertical-align: middle;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ee4d2d, #ff6b35);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.user-avatar svg {
  width: 20px;
  height: 20px;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
}

.user-username {
  font-size: 0.875rem;
  color: #6b7280;
}

.user-email {
  color: #4b5563;
  font-size: 0.875rem;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.role-badge.admin {
  background: #fef3c7;
  color: #d97706;
}

.role-badge.user {
  background: #e0f2fe;
  color: #0369a1;
}

.role-badge svg {
  width: 14px;
  height: 14px;
}

.user-date {
  color: #6b7280;
  font-size: 0.875rem;
}

.action-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover:not(:disabled) {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

.toggle-role {
  color: #059669;
  border-color: #d1fae5;
  background: #ecfdf5;
}

.toggle-role:hover:not(:disabled) {
  background: #d1fae5;
  border-color: #059669;
}

.disabled-action {
  color: #9ca3af;
  font-size: 0.75rem;
  font-style: italic;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
}

.page-btn {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.page-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  margin: 0 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .user-management {
    padding: 1rem;
  }
  
  .header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions {
    flex-direction: column;
  }
  
  .search-input {
    width: 100%;
  }
  
  .users-stats {
    grid-template-columns: 1fr;
  }
  
  .table-wrapper {
    overflow-x: auto;
  }
  
  .users-table {
    min-width: 600px;
  }
  
  .users-table th,
  .users-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.8rem;
  }
}
</style>
