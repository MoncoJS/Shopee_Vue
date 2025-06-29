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
                  @click="viewUser(user)"
                  class="action-btn view-user"
                  title="ดูข้อมูลผู้ใช้"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                </button>
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
                <button 
                  v-if="user._id !== currentUser._id"
                  @click="deleteUser(user)"
                  :disabled="deletingUser === user._id"
                  class="action-btn delete-user"
                  title="ลบผู้ใช้"
                >
                  <svg v-if="deletingUser === user._id" class="loading-icon" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.3"/>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
                <span v-else-if="user._id === currentUser._id" class="disabled-action">
                  ไม่สามารถจัดการตัวเองได้
                </span>
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

    <!-- User Details Modal -->
    <div v-if="showUserModal" class="modal-overlay" @click="closeUserModal">
      <div class="user-modal" @click.stop>
        <div class="modal-header">
          <h3>ข้อมูลผู้ใช้งาน</h3>
          <button @click="closeUserModal" class="close-btn">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        
        <div v-if="selectedUser" class="modal-body">
          <!-- User Avatar and Basic Info -->
          <div class="user-profile-header">
            <div class="user-avatar-large">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <div class="user-profile-info">
              <h4 class="user-display-name">
                {{ selectedUser.firstName || selectedUser.lastName 
                  ? `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim() 
                  : selectedUser.username 
                }}
              </h4>
              <p class="user-username-display">@{{ selectedUser.username }}</p>
              <span class="role-badge-large" :class="selectedUser.role">
                <svg v-if="selectedUser.role === 'admin'" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                {{ selectedUser.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป' }}
              </span>
            </div>
          </div>

          <!-- User Details Grid -->
          <div class="user-details-grid">
            <div class="detail-section">
              <h5>ข้อมูลส่วนตัว</h5>
              <div class="detail-item">
                <span class="detail-label">ชื่อจริง:</span>
                <span class="detail-value">{{ selectedUser.firstName || 'ไม่ระบุ' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">นามสกุล:</span>
                <span class="detail-value">{{ selectedUser.lastName || 'ไม่ระบุ' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">เพศ:</span>
                <span class="detail-value">
                  {{ selectedUser.gender === 'male' ? 'ชาย' : 
                     selectedUser.gender === 'female' ? 'หญิง' : 
                     selectedUser.gender === 'other' ? 'อื่นๆ' : 'ไม่ระบุ' }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">เบอร์โทรศัพท์:</span>
                <span class="detail-value">{{ selectedUser.phone || 'ไม่ระบุ' }}</span>
              </div>
            </div>

            <div class="detail-section">
              <h5>ข้อมูลการติดต่อ</h5>
              <div class="detail-item">
                <span class="detail-label">อีเมล:</span>
                <span class="detail-value">{{ selectedUser.email }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">ที่อยู่:</span>
                <span class="detail-value">{{ selectedUser.address || 'ไม่ระบุ' }}</span>
              </div>
            </div>

            <div class="detail-section">
              <h5>ข้อมูลระบบ</h5>
              <div class="detail-item">
                <span class="detail-label">ชื่อผู้ใช้:</span>
                <span class="detail-value">{{ selectedUser.username }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">สิทธิ์การใช้งาน:</span>
                <span class="detail-value">{{ selectedUser.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">วันที่สมัครสมาชิก:</span>
                <span class="detail-value">{{ formatDate(selectedUser.createdAt) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">แก้ไขล่าสุด:</span>
                <span class="detail-value">{{ formatDate(selectedUser.updatedAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons in Modal -->
          <div class="modal-actions">
            <button 
              v-if="selectedUser.role !== 'admin' || selectedUser._id !== currentUser._id"
              @click="toggleUserRole(selectedUser)"
              :disabled="updatingUser === selectedUser._id"
              class="action-btn-modal toggle-role"
            >
              <svg v-if="updatingUser === selectedUser._id" class="loading-icon" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.3"/>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <span v-if="updatingUser === selectedUser._id">กำลังอัปเดต...</span>
              <span v-else>
                {{ selectedUser.role === 'admin' ? 'เปลี่ยนเป็นผู้ใช้ทั่วไป' : 'เปลี่ยนเป็นผู้ดูแลระบบ' }}
              </span>
            </button>
            <button @click="closeUserModal" class="cancel-btn">ปิด</button>
          </div>
        </div>
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
      updatingUser: null,
      deletingUser: null,
      showUserModal: false,
      selectedUser: null
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
    
    async deleteUser(user) {
      if (this.deletingUser === user._id) return
      
      // Prevent deleting current user
      if (user._id === this.currentUser._id) {
        this.$notify.error('ไม่สามารถลบบัญชีตัวเองได้')
        return
      }
      
      const userName = user.firstName || user.lastName 
        ? `${user.firstName || ''} ${user.lastName || ''}`.trim() 
        : user.username
      
      const confirmMessage = `คุณแน่ใจหรือไม่ที่จะลบผู้ใช้ "${userName}" (@${user.username})?\n\nการดำเนินการนี้ไม่สามารถยกเลิกได้ และจะลบข้อมูลทั้งหมดของผู้ใช้นี้`
      
      if (!confirm(confirmMessage)) return
      
      // Double confirmation for admin deletion
      if (user.role === 'admin') {
        const adminConfirm = confirm(`ผู้ใช้นี้เป็น "ผู้ดูแลระบบ" คุณแน่ใจหรือไม่ที่ต้องการลบ?`)
        if (!adminConfirm) return
      }
      
      this.deletingUser = user._id
      
      try {
        const response = await api.delete(`/users/${user._id}`)
        
        if (response.data.success) {
          // Remove user from local array
          this.users = this.users.filter(u => u._id !== user._id)
          
          // Close modal if deleted user was being viewed
          if (this.selectedUser && this.selectedUser._id === user._id) {
            this.closeUserModal()
          }
          
          // Adjust current page if needed
          if (this.paginatedUsers.length === 0 && this.currentPage > 1) {
            this.currentPage--
          }
          
          this.$notify.success(`ลบผู้ใช้ "${userName}" เรียบร้อยแล้ว`)
        } else {
          throw new Error(response.data.message || 'ไม่สามารถลบผู้ใช้ได้')
        }
      } catch (error) {
        console.error('Error deleting user:', error)
        
        if (error.response?.status === 403) {
          this.$notify.error('คุณไม่มีสิทธิ์ในการลบผู้ใช้นี้')
        } else if (error.response?.status === 404) {
          this.$notify.error('ไม่พบผู้ใช้ที่ต้องการลบ')
        } else {
          this.$notify.error('เกิดข้อผิดพลาดในการลบผู้ใช้')
        }
      } finally {
        this.deletingUser = null
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
    },
    
    // Modal methods
    viewUser(user) {
      this.selectedUser = user
      this.showUserModal = true
    },
    
    closeUserModal() {
      this.showUserModal = false
      this.selectedUser = null
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

.user-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
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

.delete-user {
  color: #dc2626;
  border-color: #fecaca;
  background: #fef2f2;
}

.delete-user:hover:not(:disabled) {
  background: #fecaca;
  border-color: #dc2626;
  transform: scale(1.05);
}

.delete-user:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.user-modal {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 12px 12px 0 0;
}

.modal-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  color: #718096;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #2d3748;
}

.close-btn svg {
  width: 1.25rem;
  height: 1.25rem;
}

.modal-body {
  padding: 1.5rem;
}

/* User Profile Header */
.user-profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
}

.user-avatar-large {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-avatar-large svg {
  width: 40px;
  height: 40px;
  color: white;
}

.user-profile-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.user-username-display {
  margin: 0 0 1rem 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.role-badge-large {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.role-badge-large svg {
  width: 1rem;
  height: 1rem;
}

/* User Details Grid */
.user-details-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.detail-section {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1.5rem;
}

.detail-section h5 {
  margin: 0 0 1rem 0;
  color: #2d3748;
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: #4a5568;
  min-width: 140px;
}

.detail-value {
  color: #2d3748;
  font-weight: 400;
  text-align: right;
  word-break: break-word;
}

/* Modal Actions */
.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.action-btn-modal {
  background: #ee4d2d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn-modal:hover:not(:disabled) {
  background: #d73527;
}

.action-btn-modal:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn {
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #cbd5e0;
}

/* View User Button */
.view-user {
  background: #3182ce;
  color: white;
}

.view-user:hover {
  background: #2c5aa0;
}

.view-user svg {
  width: 1rem;
  height: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .user-modal {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }
  
  .user-profile-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .user-details-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .detail-value {
    text-align: left;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .action-btn-modal,
  .cancel-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
