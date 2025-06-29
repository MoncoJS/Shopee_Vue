<template>
  <div class="edit-product-view">
    <!-- Header -->
    <div class="header">
      <button @click="goBack" class="back-btn">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
        </svg>
        กลับ
      </button>
      <h1>แก้ไขสินค้า</h1>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>กำลังโหลดข้อมูลสินค้า...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>เกิดข้อผิดพลาด</h3>
      <p>{{ error }}</p>
      <button @click="fetchProduct" class="retry-btn">ลองใหม่อีกครั้ง</button>
    </div>

    <!-- Edit Form -->
    <div v-else-if="product" class="form-container">
      <form @submit.prevent="updateProduct" class="product-form">
        
        <!-- Current Product Image -->
        <div class="form-group">
          <label class="form-label">รูปภาพปัจจุบัน</label>
          <div class="current-image-container">
            <img 
              v-if="product.img" 
              :src="getProductImageUrl(product.img)" 
              :alt="product.product_name"
              class="current-image"
              @error="onImageError"
              @load="onImageLoad"
            />
            <div v-else class="no-image">ไม่มีรูปภาพ</div>
            <!-- Debug info -->
            <div v-if="product.img" class="debug-info">
              <small>Image path: {{ product.img }}</small><br>
              <small>Full URL: {{ getProductImageUrl(product.img) }}</small>
            </div>
          </div>
        </div>

        <!-- New Product Image -->
        <div class="form-group">
          <label for="image" class="form-label">
            อัปโหลดรูปภาพใหม่ (ถ้าต้องการเปลี่ยน)
          </label>
          <div class="image-upload-container">
            <input
              type="file"
              id="image"
              ref="imageInput"
              @change="handleImageChange"
              accept="image/*"
              class="file-input"
            />
            <label for="image" class="file-label">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
              <span>{{ form.image ? form.image.name : 'เลือกรูปภาพใหม่' }}</span>
            </label>
          </div>
          
          <!-- Image Preview -->
          <div v-if="imagePreview" class="image-preview-container">
            <img :src="imagePreview" alt="Preview" class="image-preview" />
            <button type="button" @click="removeImage" class="remove-image-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,6.41L17.59,5 12,10.59 6.41,5 5,6.41 10.59,12 5,17.59 6.41,19 12,13.41 17.59,19 19,17.59 13.41,12Z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Product Name -->
        <div class="form-group">
          <label for="name" class="form-label">ชื่อสินค้า *</label>
          <input
            type="text"
            id="name"
            v-model="form.name"
            required
            class="form-input"
            placeholder="กรอกชื่อสินค้า"
          />
          <div v-if="errors.name" class="error-message">{{ errors.name }}</div>
        </div>

        <!-- Product Description -->
        <div class="form-group">
          <label for="description" class="form-label">รายละเอียดสินค้า</label>
          <textarea
            id="description"
            v-model="form.description"
            rows="4"
            class="form-textarea"
            placeholder="กรอกรายละเอียดสินค้า"
          ></textarea>
        </div>

        <!-- Product Price -->
        <div class="form-group">
          <label for="price" class="form-label">ราคา (บาท) *</label>
          <input
            type="number"
            id="price"
            v-model.number="form.price"
            required
            min="0"
            step="0.01"
            class="form-input"
            placeholder="0.00"
          />
          <div v-if="errors.price" class="error-message">{{ errors.price }}</div>
        </div>

        <!-- Product Stock -->
        <div class="form-group">
          <label for="stock" class="form-label">จำนวนในสต็อก *</label>
          <input
            type="number"
            id="stock"
            v-model.number="form.stock"
            required
            min="0"
            class="form-input"
            placeholder="0"
          />
          <div v-if="errors.stock" class="error-message">{{ errors.stock }}</div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button 
            type="button" 
            @click="goBack" 
            class="cancel-btn"
            :disabled="submitting"
          >
            ยกเลิก
          </button>
          <button 
            type="submit" 
            class="submit-btn"
            :disabled="submitting || !isFormValid"
          >
            <svg v-if="submitting" class="loading-icon" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.3"/>
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <span v-if="submitting">กำลังอัปเดต...</span>
            <span v-else>อัปเดตสินค้า</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import api from '../services/api.js'

export default {
  name: 'EditProductView',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      product: null,
      loading: false,
      error: null,
      submitting: false,
      imagePreview: null,
      form: {
        name: '',
        description: '',
        price: null,
        stock: null,
        image: null
      },
      errors: {}
    }
  },
  computed: {
    isFormValid() {
      return this.form.name.trim() && 
             this.form.price !== null && 
             this.form.price >= 0 &&
             this.form.stock !== null &&
             this.form.stock >= 0
    }
  },
  async created() {
    await this.fetchProduct()
  },
  methods: {
    async fetchProduct() {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.get(`/products/${this.id}`)
        if (response.data.success) {
          this.product = response.data.data
          // Populate form with current product data
          this.form = {
            name: this.product.product_name || '',
            description: this.product.description || '',
            price: this.product.price || null,
            stock: this.product.amount || null,
            image: null // New image will be uploaded separately
          }
        } else {
          this.error = 'ไม่พบสินค้าที่ต้องการแก้ไข'
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        this.error = 'เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า'
      } finally {
        this.loading = false
      }
    },

    handleImageChange(event) {
      const file = event.target.files[0]
      if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          this.$notify.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น')
          return
        }
        
        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          this.$notify.error('ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB')
          return
        }
        
        this.form.image = file
        
        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
          this.imagePreview = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },

    removeImage() {
      this.form.image = null
      this.imagePreview = null
      if (this.$refs.imageInput) {
        this.$refs.imageInput.value = ''
      }
    },

    validateForm() {
      this.errors = {}
      
      if (!this.form.name.trim()) {
        this.errors.name = 'กรุณากรอกชื่อสินค้า'
      }
      
      if (this.form.price === null || this.form.price < 0) {
        this.errors.price = 'กรุณากรอกราคาที่ถูกต้อง'
      }
      
      if (this.form.stock === null || this.form.stock < 0) {
        this.errors.stock = 'กรุณากรอกจำนวนสต็อกที่ถูกต้อง'
      }
      
      return Object.keys(this.errors).length === 0
    },

    async updateProduct() {
      if (!this.validateForm()) {
        this.$notify.error('กรุณาตรวจสอบข้อมูลให้ถูกต้อง')
        return
      }
      
      this.submitting = true
      
      try {
        // Create FormData for file upload
        const formData = new FormData()
        formData.append('product_name', this.form.name.trim())
        formData.append('description', this.form.description.trim())
        formData.append('price', this.form.price)
        formData.append('amount', this.form.stock || 0)
        
        // Only append image if a new one is selected
        if (this.form.image) {
          formData.append('image', this.form.image)
        }
        
        const response = await api.put(`/products/${this.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        if (response.data.success) {
          this.$notify.success('อัปเดตสินค้าเรียบร้อยแล้ว')
          this.$router.push('/products')
        } else {
          throw new Error(response.data.message || 'ไม่สามารถอัปเดตสินค้าได้')
        }
      } catch (error) {
        console.error('Error updating product:', error)
        this.$notify.error('เกิดข้อผิดพลาดในการอัปเดตสินค้า')
      } finally {
        this.submitting = false
      }
    },

    getProductImageUrl(imagePath) {
      if (!imagePath) return null
      if (imagePath.startsWith('http')) return imagePath
      
      // If the imagePath already contains /uploads/, extract just the filename
      if (imagePath.startsWith('/uploads/')) {
        const filename = imagePath.replace('/uploads/', '')
        const fullUrl = `${api.defaults.baseURL}/products/image/${filename}`
        console.log('Image URL with /uploads/ prefix:', fullUrl)
        return fullUrl
      }
      
      // Otherwise, use the imagePath as the filename
      const fullUrl = `${api.defaults.baseURL}/products/image/${imagePath}`
      console.log('Image URL without prefix:', fullUrl)
      return fullUrl
    },

    onImageError(event) {
      console.error('Image failed to load:', event.target.src)
      this.$notify.error('ไม่สามารถโหลดรูปภาพได้')
    },

    onImageLoad(event) {
      console.log('Image loaded successfully:', event.target.src)
    },

    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped>
.edit-product-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
}

.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.back-btn svg {
  width: 1.25rem;
  height: 1.25rem;
}

.header h1 {
  color: white;
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

.loading-state, .error-state {
  text-align: center;
  padding: 3rem;
  color: white;
  max-width: 600px;
  margin: 0 auto;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
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
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.form-container {
  max-width: 800px;
  margin: 0 auto;
}

.product-form {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #ee4d2d;
  box-shadow: 0 0 0 3px rgba(238, 77, 45, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.current-image-container {
  margin-bottom: 1rem;
}

.debug-info {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #f3f4f6;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.75rem;
  color: #6b7280;
}

.current-image {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
}

.no-image {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  color: #6b7280;
  font-size: 0.875rem;
}

.image-upload-container {
  position: relative;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.file-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f9fafb;
  color: #374151;
  font-size: 0.875rem;
}

.file-label:hover {
  border-color: #ee4d2d;
  background: #fef2f2;
  color: #ee4d2d;
}

.file-label svg {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.image-preview-container {
  position: relative;
  margin-top: 1rem;
  display: inline-block;
}

.image-preview {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
}

.remove-image-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s ease;
}

.remove-image-btn:hover {
  background: #dc2626;
}

.remove-image-btn svg {
  width: 1rem;
  height: 1rem;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.cancel-btn, .submit-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cancel-btn {
  background: #f3f4f6;
  color: #374151;
}

.cancel-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.submit-btn {
  background: #ee4d2d;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #dc2626;
}

.submit-btn:disabled, .cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-icon {
  width: 1rem;
  height: 1rem;
  animation: spin 1s linear infinite;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .edit-product-view {
    padding: 1rem 0.5rem;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header h1 {
    font-size: 1.5rem;
  }
  
  .product-form {
    padding: 1.5rem;
    border-radius: 12px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .cancel-btn, .submit-btn {
    width: 100%;
    justify-content: center;
  }
  
  .current-image, .image-preview, .no-image {
    width: 150px;
    height: 150px;
  }
}
</style>
