<template>
  <div class="profile-page">
    <!-- Header -->
    <div class="profile-header">
      <div class="container">
        <h1 class="profile-title">
          <svg class="profile-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          โปรไฟล์ของฉัน
        </h1>
        <div class="breadcrumb">
          <router-link to="/" class="breadcrumb-link">หน้าหลัก</router-link>
          <span class="breadcrumb-separator">›</span>
          <span class="breadcrumb-current">โปรไฟล์</span>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="profile-content">
      <div class="container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>กำลังโหลดข้อมูลโปรไฟล์...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="errorMessage" class="error-state">
          <div class="error-icon">⚠️</div>
          <h3>เกิดข้อผิดพลาด</h3>
          <p>{{ errorMessage }}</p>
          <button @click="fetchProfile" class="retry-btn">ลองใหม่อีกครั้ง</button>
        </div>

        <!-- Profile Content -->
        <div v-else-if="user" class="profile-grid">
          <!-- Profile Card -->
          <div class="profile-card">
            <div class="profile-avatar">
              <div class="avatar-circle">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            </div>
            <div class="profile-info">
              <h2 class="profile-name">{{ user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username }}</h2>
              <p class="profile-role">{{ user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'สมาชิก' }}</p>
              <p class="profile-joined">เข้าร่วมเมื่อ {{ formatDate(user.createdAt) }}</p>
            </div>
            <button @click="showEditDialog = true" class="edit-profile-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
              แก้ไขโปรไฟล์
            </button>
          </div>

          <!-- Profile Details -->
          <div class="profile-details">
            <h3 class="details-title">ข้อมูลส่วนตัว</h3>
            <div class="details-grid">
              <div class="detail-item">
                <label class="detail-label">ชื่อผู้ใช้</label>
                <span class="detail-value">{{ user.username }}</span>
              </div>
              <div class="detail-item">
                <label class="detail-label">อีเมล</label>
                <span class="detail-value">{{ user.email || 'ไม่ได้ระบุ' }}</span>
              </div>
              <div class="detail-item">
                <label class="detail-label">ชื่อ</label>
                <span class="detail-value">{{ user.firstName || 'ไม่ได้ระบุ' }}</span>
              </div>
              <div class="detail-item">
                <label class="detail-label">นามสกุล</label>
                <span class="detail-value">{{ user.lastName || 'ไม่ได้ระบุ' }}</span>
              </div>
              <div class="detail-item">
                <label class="detail-label">เบอร์โทรศัพท์</label>
                <span class="detail-value">{{ user.phone || 'ไม่ได้ระบุ' }}</span>
              </div>
              <div class="detail-item">
                <label class="detail-label">เพศ</label>
                <span class="detail-value">{{ getGenderText(user.gender) }}</span>
              </div>
              <div class="detail-item">
                <label class="detail-label">ที่อยู่</label>
                <span class="detail-value">{{ user.address || 'ไม่ได้ระบุ' }}</span>
              </div>
            </div>
          </div>

          <!-- Account Settings -->
          <div class="account-settings">
            <h3 class="settings-title">การตั้งค่าบัญชี</h3>
            <div class="settings-list">
              <button @click="showChangePasswordDialog = true" class="setting-item">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
                <div class="setting-content">
                  <span class="setting-title">เปลี่ยนรหัสผ่าน</span>
                  <span class="setting-desc">อัปเดตรหัสผ่านของคุณ</span>
                </div>
                <svg class="setting-arrow" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Profile Dialog -->
    <div v-if="showEditDialog" class="dialog-overlay" @click="closeEditDialog">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h3>แก้ไขโปรไฟล์</h3>
          <button @click="closeEditDialog" class="close-btn">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <form @submit.prevent="updateProfile" class="dialog-body">
          <div class="form-group">
            <label for="edit-firstName">ชื่อ</label>
            <input
              id="edit-firstName"
              v-model="editForm.firstName"
              type="text"
              placeholder="กรอกชื่อ"
            >
          </div>
          <div class="form-group">
            <label for="edit-lastName">นามสกุล</label>
            <input
              id="edit-lastName"
              v-model="editForm.lastName"
              type="text"
              placeholder="กรอกนามสกุล"
            >
          </div>
          <div class="form-group">
            <label for="edit-email">อีเมล</label>
            <input
              id="edit-email"
              v-model="editForm.email"
              type="email"
              placeholder="กรอกอีเมล"
            >
          </div>
          <div class="form-group">
            <label for="edit-phone">เบอร์โทรศัพท์</label>
            <input
              id="edit-phone"
              v-model="editForm.phone"
              type="tel"
              placeholder="กรอกเบอร์โทรศัพท์"
            >
          </div>
          <div class="form-group">
            <label for="edit-gender">เพศ</label>
            <select
              id="edit-gender"
              v-model="editForm.gender"
            >
              <option value="">เลือกเพศ</option>
              <option value="male">ชาย</option>
              <option value="female">หญิง</option>
              <option value="other">อื่นๆ</option>
            </select>
          </div>
          <div class="form-group">
            <label for="edit-address">ที่อยู่</label>
            <textarea
              id="edit-address"
              v-model="editForm.address"
              rows="3"
              placeholder="กรอกที่อยู่"
            ></textarea>
          </div>
          <div class="dialog-actions">
            <button type="button" @click="closeEditDialog" class="cancel-btn">ยกเลิก</button>
            <button type="submit" :disabled="updateLoading" class="save-btn">
              <span v-if="updateLoading">กำลังบันทึก...</span>
              <span v-else>บันทึก</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Change Password Dialog -->
    <div v-if="showChangePasswordDialog" class="dialog-overlay" @click="closeChangePasswordDialog">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h3>เปลี่ยนรหัสผ่าน</h3>
          <button @click="closeChangePasswordDialog" class="close-btn">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <form @submit.prevent="changePassword" class="dialog-body">
          <div class="form-group">
            <label for="current-password">รหัสผ่านปัจจุบัน</label>
            <input
              id="current-password"
              v-model="passwordForm.currentPassword"
              type="password"
              placeholder="กรอกรหัสผ่านปัจจุบัน"
              required
            >
          </div>
          <div class="form-group">
            <label for="new-password">รหัสผ่านใหม่</label>
            <input
              id="new-password"
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="กรอกรหัสผ่านใหม่"
              required
              minlength="6"
            >
          </div>
          <div class="form-group">
            <label for="confirm-password">ยืนยันรหัสผ่านใหม่</label>
            <input
              id="confirm-password"
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="ยืนยันรหัสผ่านใหม่"
              required
            >
          </div>
          <div class="dialog-actions">
            <button type="button" @click="closeChangePasswordDialog" class="cancel-btn">ยกเลิก</button>
            <button type="submit" :disabled="passwordLoading" class="save-btn">
              <span v-if="passwordLoading">กำลังเปลี่ยน...</span>
              <span v-else>เปลี่ยนรหัสผ่าน</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import api from '@/services/api'

export default {
  name: 'ProfileView',
  data() {
    return {
      user: null,
      loading: false,
      errorMessage: '',
      showEditDialog: false,
      showChangePasswordDialog: false,
      updateLoading: false,
      passwordLoading: false,
      editForm: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        gender: '',
        address: ''
      },
      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    }
  },
  computed: {
    ...mapGetters(['isLoggedIn', 'getUser'])
  },
  async mounted() {
    if (this.isLoggedIn) {
      await this.fetchProfile()
    }
  },
  watch: {
    isLoggedIn(newVal) {
      if (newVal) {
        this.fetchProfile()
      } else {
        this.user = null
      }
    }
  },
  methods: {
    async fetchProfile() {
      this.loading = true
      this.errorMessage = ''
      
      try {
        // ใช้ข้อมูลจาก store ก่อน
        if (this.getUser) {
          this.user = { ...this.getUser }
          this.initEditForm()
        }
        
        // ถ้าไม่มีข้อมูลใน store ให้ fetch จาก API
        if (!this.user) {
          await this.$store.dispatch('fetchUser')
          if (this.getUser) {
            this.user = { ...this.getUser }
            this.initEditForm()
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        this.errorMessage = 'ไม่สามารถโหลดข้อมูลโปรไฟล์ได้'
      } finally {
        this.loading = false
      }
    },
    
    initEditForm() {
      if (this.user) {
        this.editForm = {
          firstName: this.user.firstName || '',
          lastName: this.user.lastName || '',
          email: this.user.email || '',
          phone: this.user.phone || '',
          gender: this.user.gender || '',
          address: this.user.address || ''
        }
      }
    },
    
    getGenderText(gender) {
      switch (gender) {
        case 'male': return 'ชาย'
        case 'female': return 'หญิง'  
        case 'other': return 'อื่นๆ'
        default: return 'ไม่ได้ระบุ'
      }
    },
    
    closeEditDialog() {
      this.showEditDialog = false
      this.initEditForm() // Reset form
    },
    
    closeChangePasswordDialog() {
      this.showChangePasswordDialog = false
      this.passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    },
    
    async updateProfile() {
      this.updateLoading = true
      
      try {
        const response = await api.put(`/users/${this.user._id}`, this.editForm)
        
        if (response.data.success) {
          // อัปเดตข้อมูลใน component และ store
          this.user = { ...this.user, ...this.editForm }
          this.$store.commit('setUser', this.user)
          
          this.$notification.success('อัปเดตโปรไฟล์เรียบร้อยแล้ว')
          this.showEditDialog = false
        } else {
          throw new Error(response.data.message || 'ไม่สามารถอัปเดตโปรไฟล์ได้')
        }
      } catch (error) {
        console.error('Error updating profile:', error)
        this.$notification.error(error.response?.data?.message || error.message || 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์')
      } finally {
        this.updateLoading = false
      }
    },
    
    async changePassword() {
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        this.$notification.error('รหัสผ่านใหม่และการยืนยันไม่ตรงกัน')
        return
      }
      
      if (this.passwordForm.newPassword.length < 6) {
        this.$notification.error('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร')
        return
      }
      
      this.passwordLoading = true
      
      try {
        const response = await api.put(`/users/${this.user._id}/password`, {
          currentPassword: this.passwordForm.currentPassword,
          newPassword: this.passwordForm.newPassword
        })
        
        if (response.data.success) {
          this.$notification.success('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว')
          this.showChangePasswordDialog = false
          this.passwordForm = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }
        } else {
          throw new Error(response.data.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้')
        }
      } catch (error) {
        console.error('Error changing password:', error)
        this.$notification.error(error.response?.data?.message || error.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน')
      } finally {
        this.passwordLoading = false
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return 'ไม่ทราบ'
      
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      } catch (error) {
        return 'ไม่ทราบ'
      }
    }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f8f9fa;
}

/* Header */
.profile-header {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem 0;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.profile-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.profile-icon {
  width: 3rem;
  height: 3rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.9;
}

.breadcrumb-link {
  color: #666;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: #ee4d2d;
}

.breadcrumb-separator {
  opacity: 0.4;
  color: #999;
}

.breadcrumb-current {
  font-weight: 600;
}

/* Content */
.profile-content {
  padding: 2rem 0;
}

/* Loading & Error States */
.loading-state, .error-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #ee4d2d;
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
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
  margin-top: 1rem;
}

.retry-btn:hover {
  background: #d73527;
}

/* Profile Grid */
.profile-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

/* Profile Card */
.profile-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  height: fit-content;
}

.profile-avatar {
  margin-bottom: 1.5rem;
}

.avatar-circle {
  width: 8rem;
  height: 8rem;
  background: linear-gradient(135deg, #ee4d2d, #ff6b35);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  color: white;
}

.avatar-circle svg {
  width: 4rem;
  height: 4rem;
}

.profile-name {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #333;
}

.profile-role {
  color: #ee4d2d;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.profile-joined {
  color: #666;
  margin: 0 0 1.5rem 0;
}

.edit-profile-btn {
  background: #ee4d2d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
  transition: background 0.2s;
}

.edit-profile-btn:hover {
  background: #d73527;
}

.edit-profile-btn svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* Profile Details */
.profile-details {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.details-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
  color: #333;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-label {
  font-weight: 600;
  color: #666;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 1rem;
  color: #333;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  border: 1px solid #e9ecef;
}

/* Account Settings */
.account-settings {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  grid-column: 1 / -1;
}

.settings-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
  color: #333;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: transparent;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
}

.setting-item:hover {
  background: #f8f9fa;
  border-color: #ee4d2d;
}

.setting-item svg:first-child {
  width: 1.5rem;
  height: 1.5rem;
  color: #ee4d2d;
  flex-shrink: 0;
}

.setting-content {
  flex: 1;
}

.setting-title {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.setting-desc {
  display: block;
  color: #666;
  font-size: 0.875rem;
}

.setting-arrow {
  width: 1.25rem;
  height: 1.25rem;
  color: #999;
  flex-shrink: 0;
}

/* Dialog */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.dialog {
  background: white;
  border-radius: 1rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e9ecef;
}

.dialog-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #666;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f8f9fa;
  color: #333;
}

.close-btn svg {
  width: 1.5rem;
  height: 1.5rem;
}

.dialog-body {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
  background: white;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #ee4d2d;
  box-shadow: 0 0 0 3px rgba(238, 77, 45, 0.1);
}

.form-group select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

.dialog-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.cancel-btn, .save-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.cancel-btn {
  background: #f8f9fa;
  color: #666;
}

.cancel-btn:hover {
  background: #e9ecef;
}

.save-btn {
  background: #ee4d2d;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #d73527;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
  
  .profile-title {
    font-size: 2rem;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .dialog {
    margin: 1rem;
    width: calc(100% - 2rem);
  }
  
  .dialog-body {
    padding: 1.5rem;
  }
  
  .dialog-actions {
    flex-direction: column-reverse;
  }
  
  .cancel-btn, .save-btn {
    width: 100%;
  }
}
</style>
