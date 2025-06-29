<template>
  <div class="add-product-page">
    <!-- Header -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">
          <svg class="page-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          เพิ่มสินค้าใหม่
        </h1>
        <div class="breadcrumb">
          <router-link to="/products" class="breadcrumb-link">สินค้า</router-link>
          <span class="breadcrumb-separator">›</span>
          <span class="breadcrumb-current">เพิ่มสินค้า</span>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="page-content">
      <div class="container">
        <div class="add-product-form-container">
          <!-- Loading State -->
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>กำลังบันทึกสินค้า...</p>
          </div>

          <!-- Form -->
          <form v-else @submit.prevent="addProduct" class="add-product-form">
            <div class="form-grid">
              <!-- Product Image -->
              <div class="form-section image-section">
                <h3 class="section-title">รูปภาพสินค้า</h3>
                <div class="image-upload-area">
                  <div 
                    v-if="!imagePreview" 
                    class="upload-placeholder"
                    @click="triggerFileInput"
                    @dragover.prevent
                    @drop.prevent="handleFileDrop"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                    <p>คลิกหรือลากไฟล์มาวางที่นี่</p>
                    <small>รองรับไฟล์ JPG, PNG, GIF (ขนาดไม่เกิน 5MB)</small>
                  </div>
                  <div v-else class="image-preview">
                    <img :src="imagePreview" alt="Product Preview" />
                    <div class="image-actions">
                      <button type="button" @click="changeImage" class="change-btn">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                        เปลี่ยนรูป
                      </button>
                      <button type="button" @click="removeImage" class="remove-btn">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                        ลบรูป
                      </button>
                    </div>
                  </div>
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    @change="handleFileSelect"
                    style="display: none"
                  />
                </div>
              </div>

              <!-- Product Details -->
              <div class="form-section details-section">
                <h3 class="section-title">ข้อมูลสินค้า</h3>
                
                <div class="form-group">
                  <label for="product-name" class="required">ชื่อสินค้า</label>
                  <input
                    id="product-name"
                    v-model="productForm.product_name"
                    type="text"
                    placeholder="กรอกชื่อสินค้า"
                    required
                    maxlength="100"
                  />
                  <small class="char-count">{{ productForm.product_name.length }}/100</small>
                </div>

                <div class="form-group">
                  <label for="product-description">รายละเอียดสินค้า</label>
                  <textarea
                    id="product-description"
                    v-model="productForm.description"
                    rows="4"
                    placeholder="กรอกรายละเอียดสินค้า"
                    maxlength="500"
                  ></textarea>
                  <small class="char-count">{{ productForm.description.length }}/500</small>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="product-price" class="required">ราคา (บาท)</label>
                    <input
                      id="product-price"
                      v-model.number="productForm.price"
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div class="form-group">
                    <label for="product-amount" class="required">จำนวนสินค้า</label>
                    <input
                      id="product-amount"
                      v-model.number="productForm.amount"
                      type="number"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <!-- Category (Optional for future enhancement) -->
                <div class="form-group">
                  <label for="product-category">หมวดหมู่</label>
                  <select id="product-category" v-model="productForm.category">
                    <option value="">เลือกหมวดหมู่</option>
                    <option value="electronics">อิเล็กทรอนิกส์</option>
                    <option value="clothing">เสื้อผ้า</option>
                    <option value="books">หนังสือ</option>
                    <option value="sports">กีฬา</option>
                    <option value="home">บ้านและสวน</option>
                    <option value="beauty">ความงาม</option>
                    <option value="food">อาหารและเครื่องดื่ม</option>
                    <option value="toys">ของเล่น</option>
                    <option value="automotive">ยานยนต์</option>
                    <option value="other">อื่นๆ</option>
                  </select>
                </div>

                <!-- Tags (Optional) -->
                <div class="form-group">
                  <label for="product-tags">แท็ก</label>
                  <input
                    id="product-tags"
                    v-model="productForm.tags"
                    type="text"
                    placeholder="แท็กสินค้า เช่น ใหม่, ลดราคา, ยอดนิยม (คั่นด้วยเครื่องหมายจุลภาค)"
                  />
                  <small class="form-hint">แยกแต่ละแท็กด้วยเครื่องหมายจุลภาค (,)</small>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <router-link to="/products" class="cancel-btn">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
                ยกเลิก
              </router-link>
              <button type="submit" :disabled="!isFormValid || loading" class="save-btn">
                <svg v-if="!loading" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                </svg>
                <span v-if="loading">กำลังบันทึก...</span>
                <span v-else>บันทึกสินค้า</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'AddProductView',
  data() {
    return {
      loading: false,
      imageFile: null,
      imagePreview: null,
      productForm: {
        product_name: '',
        description: '',
        price: '',
        amount: '',
        category: '',
        tags: '',
        img: ''
      }
    }
  },
  computed: {
    isFormValid() {
      return (
        this.productForm.product_name.trim() &&
        this.productForm.price > 0 &&
        this.productForm.amount >= 0
      )
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click()
    },

    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file) {
        this.processFile(file)
      }
    },

    handleFileDrop(event) {
      const file = event.dataTransfer.files[0]
      if (file) {
        this.processFile(file)
      }
    },

    processFile(file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        if (this.$notify && this.$notify.error) {
          this.$notify.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น')
        } else {
          alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น')
        }
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        if (this.$notify && this.$notify.error) {
          this.$notify.error('ขนาดไฟล์ต้องไม่เกิน 5MB')
        } else {
          alert('ขนาดไฟล์ต้องไม่เกิน 5MB')
        }
        return
      }

      this.imageFile = file

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        this.imagePreview = e.target.result
      }
      reader.readAsDataURL(file)
    },

    changeImage() {
      this.triggerFileInput()
    },

    removeImage() {
      this.imageFile = null
      this.imagePreview = null
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },

    async addProduct() {
      if (!this.isFormValid) {
        if (this.$notify && this.$notify.error) {
          this.$notify.error('กรุณากรอกข้อมูลให้ครบถ้วน')
        } else {
          alert('กรุณากรอกข้อมูลให้ครบถ้วน')
        }
        return
      }

      this.loading = true

      try {
        // Prepare form data for product creation with image
        const formData = new FormData()
        formData.append('product_name', this.productForm.product_name.trim())
        formData.append('description', this.productForm.description.trim())
        formData.append('price', Number(this.productForm.price))
        formData.append('amount', Number(this.productForm.amount))
        
        // Add image if exists
        if (this.imageFile) {
          formData.append('image', this.imageFile)
        }

        // Add optional fields if they have values
        if (this.productForm.category) {
          formData.append('category', this.productForm.category)
        }

        if (this.productForm.tags) {
          const tags = this.productForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
          formData.append('tags', JSON.stringify(tags))
        }

        // Create product
        const response = await api.post('/products/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        if (response && response.data && response.data.success) {
          if (this.$notify && this.$notify.success) {
            this.$notify.success('เพิ่มสินค้าเรียบร้อยแล้ว')
          } else {
            alert('เพิ่มสินค้าเรียบร้อยแล้ว')
          }
          
          // Reset form
          this.resetForm()
          
          // Redirect to products page
          this.$router.push('/products')
        } else {
          throw new Error((response && response.data && response.data.message) || 'ไม่สามารถเพิ่มสินค้าได้')
        }
      } catch (error) {
        console.error('Error adding product:', error)
        const errorMessage = error.message || 'เกิดข้อผิดพลาดในการเพิ่มสินค้า'
        if (this.$notify && this.$notify.error) {
          this.$notify.error(errorMessage)
        } else {
          alert(errorMessage)
        }
      } finally {
        this.loading = false
      }
    },

    resetForm() {
      this.productForm = {
        product_name: '',
        description: '',
        price: '',
        amount: '',
        category: '',
        tags: '',
        img: ''
      }
      this.removeImage()
    }
  }
}
</script>

<style scoped>
.add-product-page {
  min-height: 100vh;
  background: #f8f9fa;
}

/* Header */
.page-header {
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

.page-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #333;
}

.page-icon {
  width: 3rem;
  height: 3rem;
  color: #ee4d2d;
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
  color: #333;
}

/* Content */
.page-content {
  padding: 2rem 0;
}

.add-product-form-container {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Loading */
.loading-state {
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

/* Form */
.add-product-form {
  padding: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 3rem;
  margin-bottom: 2rem;
}

.form-section {
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
  color: #333;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #ee4d2d;
}

/* Image Upload */
.image-upload-area {
  flex: 1;
}

.upload-placeholder {
  border: 2px dashed #ddd;
  border-radius: 1rem;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.upload-placeholder:hover {
  border-color: #ee4d2d;
  background: #fff5f5;
}

.upload-placeholder svg {
  width: 4rem;
  height: 4rem;
  color: #ccc;
  margin-bottom: 1rem;
}

.upload-placeholder p {
  font-size: 1.1rem;
  font-weight: 600;
  color: #666;
  margin: 0 0 0.5rem 0;
}

.upload-placeholder small {
  color: #999;
  font-size: 0.9rem;
}

.image-preview {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.image-preview img {
  width: 100%;
  height: 300px;
  object-fit: cover;
  display: block;
}

.image-actions {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
}

.change-btn, .remove-btn {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  transition: background 0.2s;
}

.change-btn:hover {
  background: rgba(238, 77, 45, 0.9);
}

.remove-btn:hover {
  background: rgba(220, 53, 69, 0.9);
}

.change-btn svg, .remove-btn svg {
  width: 1rem;
  height: 1rem;
}

/* Form Fields */
.form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.form-group label.required::after {
  content: ' *';
  color: #ee4d2d;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.char-count {
  position: absolute;
  bottom: -1.25rem;
  right: 0;
  color: #999;
  font-size: 0.75rem;
}

.form-hint {
  color: #666;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 2rem;
  border-top: 1px solid #e9ecef;
}

.cancel-btn, .save-btn {
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  border: none;
  font-size: 1rem;
}

.cancel-btn {
  background: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
}

.cancel-btn:hover {
  background: #e9ecef;
  color: #333;
}

.save-btn {
  background: #ee4d2d;
  color: white;
  border: 1px solid #ee4d2d;
}

.save-btn:hover:not(:disabled) {
  background: #d73527;
  border-color: #d73527;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn svg, .save-btn svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .cancel-btn, .save-btn {
    width: 100%;
    justify-content: center;
  }
  
  .add-product-form {
    padding: 1.5rem;
  }
  
  .upload-placeholder {
    padding: 2rem 1rem;
    min-height: 200px;
  }
  
  .image-preview img {
    height: 200px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.75rem;
  }
  
  .page-icon {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .section-title {
    font-size: 1.25rem;
  }
}
</style>
