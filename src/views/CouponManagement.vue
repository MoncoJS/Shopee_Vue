<template>
  <div class="coupon-management-page">
    <!-- Header -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">
          <svg class="page-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.79 21L3 11.21v2c0 .45.35.79.79.79h8.21l-.01-.79zM11.21 3H5c-.45 0-.79.35-.79.79v6.21l8.79 8.79L11.21 3z"/>
            <path d="M12.79 21L3 11.21v2c0 .45.35.79.79.79h8.21l-.01-.79zM11.21 3H5c-.45 0-.79.35-.79.79v6.21l8.79 8.79L11.21 3z"/>
          </svg>
          จัดการคูปองส่วนลด
        </h1>
        <button @click="showCreateModal = true" class="create-btn">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          เพิ่มคูปองใหม่
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="page-content">
      <div class="container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>กำลังโหลดคูปอง...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <div class="error-icon">⚠️</div>
          <h3>เกิดข้อผิดพลาด</h3>
          <p>{{ error }}</p>
          <button @click="fetchCoupons" class="retry-btn">ลองใหม่</button>
        </div>

        <!-- Coupons List -->
        <div v-else class="coupons-container">
          <div v-if="!coupons || coupons.length === 0" class="empty-state">
            <div class="empty-icon">🎫</div>
            <h3>ไม่มีคูปอง</h3>
            <p>เริ่มต้นด้วยการสร้างคูปองแรกของคุณ</p>
            <button @click="showCreateModal = true" class="create-btn">เพิ่มคูปองใหม่</button>
          </div>

          <div v-else class="coupons-grid">
            <div 
              v-for="coupon in coupons" 
              :key="coupon._id" 
              class="coupon-card"
              :class="{ 'inactive': !coupon.isActive, 'expired': isExpired(coupon) }"
            >
              <div class="coupon-header">
                <div class="coupon-code">{{ coupon.code }}</div>
                <div class="coupon-status">
                  <span v-if="!coupon.isActive" class="status-badge inactive">ไม่ใช้งาน</span>
                  <span v-else-if="isExpired(coupon)" class="status-badge expired">หมดอายุ</span>
                  <span v-else class="status-badge active">ใช้งานได้</span>
                </div>
              </div>

              <div class="coupon-body">
                <h3 class="coupon-name">{{ coupon.name || 'ไม่มีชื่อ' }}</h3>
                <div class="coupon-discount">
                  <span v-if="coupon.discountType === 'percentage'">
                    ลด {{ coupon.discountValue }}%
                  </span>
                  <span v-else>
                    ลด ฿{{ formatPrice(coupon.discountValue) }}
                  </span>
                </div>
                <div class="coupon-expiry">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                  </svg>
                  หมดอายุ: {{ formatDate(coupon.expirationDate) }}
                </div>
              </div>

              <div class="coupon-actions">
                <button @click="editCoupon(coupon)" class="edit-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                  แก้ไข
                </button>
                <button @click="deleteCoupon(coupon)" class="delete-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                  ลบ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>{{ showCreateModal ? 'เพิ่มคูปองใหม่' : 'แก้ไขคูปอง' }}</h2>
          <button @click="closeModal" class="close-btn">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveCoupon" class="modal-body">
          <div class="form-group">
            <label>ชื่อคูปอง</label>
            <input 
              v-model="couponForm.name" 
              type="text" 
              placeholder="เช่น ส่วนลดสมาชิกใหม่"
              required
            />
          </div>

          <div class="form-group">
            <label>รหัสคูปอง</label>
            <div class="code-input-group">
              <input 
                v-model="couponForm.code" 
                type="text" 
                placeholder="ใส่รหัส หรือปล่อยว่างเพื่อสร้างอัตโนมัติ"
                @input="couponForm.code = couponForm.code.toUpperCase()"
              />
              <button type="button" @click="generateCode" class="generate-btn">สุ่ม</button>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>ประเภทส่วนลด</label>
              <select v-model="couponForm.discountType" required>
                <option value="percentage">เปอร์เซ็นต์ (%)</option>
                <option value="fixed">จำนวนเงิน (บาท)</option>
              </select>
            </div>

            <div class="form-group">
              <label>ค่าส่วนลด</label>
              <input 
                v-model.number="couponForm.discountValue" 
                type="number" 
                :placeholder="couponForm.discountType === 'percentage' ? 'เช่น 10' : 'เช่น 100'"
                :min="couponForm.discountType === 'percentage' ? 1 : 1"
                :max="couponForm.discountType === 'percentage' ? 100 : undefined"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label>วันหมดอายุ</label>
            <input 
              v-model="couponForm.expirationDate" 
              type="datetime-local" 
              required
            />
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input 
                v-model="couponForm.isActive" 
                type="checkbox"
              />
              <span class="checkmark"></span>
              ใช้งานคูปองนี้
            </label>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="cancel-btn">ยกเลิก</button>
            <button type="submit" :disabled="saving" class="save-btn">
              <span v-if="saving">กำลังบันทึก...</span>
              <span v-else>{{ showCreateModal ? 'เพิ่มคูปอง' : 'บันทึก' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'CouponManagement',
  data() {
    return {
      loading: false,
      saving: false,
      error: null,
      coupons: [],
      showCreateModal: false,
      showEditModal: false,
      editingCoupon: null,
      couponForm: {
        name: '',
        code: '',
        discountType: 'percentage',
        discountValue: '',
        expirationDate: '',
        isActive: true
      }
    }
  },
  async created() {
    await this.fetchCoupons()
  },
  methods: {
    async fetchCoupons() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/coupons/')
        if (response.data.success) {
          this.coupons = response.data.data
        } else {
          throw new Error(response.data.message || 'ไม่สามารถโหลดคูปองได้')
        }
      } catch (error) {
        console.error('Error fetching coupons:', error)
        this.error = error.message || 'เกิดข้อผิดพลาดในการโหลดคูปอง'
      } finally {
        this.loading = false
      }
    },
    
    generateCode() {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let result = ''
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      this.couponForm.code = result
    },
    
    editCoupon(coupon) {
      this.editingCoupon = coupon
      this.couponForm = {
        name: coupon.name || '',
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        expirationDate: new Date(coupon.expirationDate).toISOString().slice(0, 16),
        isActive: coupon.isActive
      }
      this.showEditModal = true
    },
    
    async saveCoupon() {
      this.saving = true
      try {
        if (this.showCreateModal) {
          const response = await api.post('/coupons/', this.couponForm)
          if (response.data.success) {
            this.$notify.success('เพิ่มคูปองสำเร็จ')
            await this.fetchCoupons()
            this.closeModal()
          } else {
            throw new Error(response.data.message || 'ไม่สามารถเพิ่มคูปองได้')
          }
        } else {
          const response = await api.put(`/coupons/${this.editingCoupon._id}`, this.couponForm)
          if (response.data.success) {
            this.$notify.success('แก้ไขคูปองสำเร็จ')
            await this.fetchCoupons()
            this.closeModal()
          } else {
            throw new Error(response.data.message || 'ไม่สามารถแก้ไขคูปองได้')
          }
        }
      } catch (error) {
        console.error('Error saving coupon:', error)
        this.$notify.error(error.message || 'เกิดข้อผิดพลาดในการบันทึกคูปอง')
      } finally {
        this.saving = false
      }
    },
    
    async deleteCoupon(coupon) {
      if (!confirm(`คุณต้องการลบคูปอง "${coupon.code}" หรือไม่?`)) return
      
      try {
        const response = await api.delete(`/coupons/${coupon._id}`)
        if (response.data.success) {
          this.$notify.success('ลบคูปองสำเร็จ')
          await this.fetchCoupons()
        } else {
          throw new Error(response.data.message || 'ไม่สามารถลบคูปองได้')
        }
      } catch (error) {
        console.error('Error deleting coupon:', error)
        this.$notify.error(error.message || 'เกิดข้อผิดพลาดในการลบคูปอง')
      }
    },
    
    closeModal() {
      this.showCreateModal = false
      this.showEditModal = false
      this.editingCoupon = null
      this.couponForm = {
        name: '',
        code: '',
        discountType: 'percentage',
        discountValue: '',
        expirationDate: '',
        isActive: true
      }
    },
    
    isExpired(coupon) {
      return new Date(coupon.expirationDate) < new Date()
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    formatPrice(price) {
      return price.toLocaleString('th-TH')
    }
  }
}
</script>

<style scoped>
.coupon-management-page {
  min-height: 100vh;
  background: #f8f9fa;
}

/* Header */
.page-header {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #333;
}

.page-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #ee4d2d;
}

.create-btn {
  background: #ee4d2d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;
}

.create-btn:hover {
  background: #d73527;
}

.create-btn svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* Content */
.page-content {
  padding: 2rem 0;
}

.page-content .container {
  display: block;
}

/* Loading, Error, Empty States */
.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 4rem 2rem;
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

.error-icon, .empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.retry-btn {
  background: #ee4d2d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;
}

/* Coupons Grid */
.coupons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.coupon-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.coupon-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.coupon-card.inactive {
  opacity: 0.6;
  background: #f8f9fa;
}

.coupon-card.expired {
  border-left: 4px solid #dc3545;
}

.coupon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.coupon-code {
  font-family: 'Courier New', monospace;
  font-size: 1.25rem;
  font-weight: 700;
  color: #ee4d2d;
  background: #fff5f5;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 2px dashed #ee4d2d;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.expired {
  background: #f8d7da;
  color: #721c24;
}

.coupon-body h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.coupon-discount {
  font-size: 1.125rem;
  font-weight: 600;
  color: #28a745;
  margin-bottom: 0.75rem;
}

.coupon-expiry {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.coupon-expiry svg {
  width: 1rem;
  height: 1rem;
}

.coupon-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.edit-btn, .delete-btn {
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background 0.2s;
}

.edit-btn {
  background: #e9ecef;
  color: #495057;
}

.edit-btn:hover {
  background: #dee2e6;
}

.delete-btn {
  background: #f8d7da;
  color: #721c24;
}

.delete-btn:hover {
  background: #f5c6cb;
}

.edit-btn svg, .delete-btn svg {
  width: 1rem;
  height: 1rem;
}

/* Modal */
.modal-overlay {
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
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  color: #666;
}

.close-btn:hover {
  background: #f8f9fa;
}

.close-btn svg {
  width: 1.25rem;
  height: 1.25rem;
}

.modal-body {
  padding: 1.5rem;
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
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #ee4d2d;
  box-shadow: 0 0 0 3px rgba(238, 77, 45, 0.1);
}

.code-input-group {
  display: flex;
  gap: 0.5rem;
}

.code-input-group input {
  flex: 1;
}

.generate-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
}

.generate-btn:hover {
  background: #5a6268;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: normal !important;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.cancel-btn, .save-btn {
  padding: 0.75rem 2rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background 0.2s;
}

.cancel-btn {
  background: #e9ecef;
  color: #495057;
}

.cancel-btn:hover {
  background: #dee2e6;
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

/* Responsive */
@media (max-width: 768px) {
  .page-header .container {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .page-title {
    font-size: 1.5rem;
    justify-content: center;
  }

  .coupons-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal {
    width: 95%;
    margin: 1rem;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .cancel-btn, .save-btn {
    width: 100%;
  }
}
</style>
