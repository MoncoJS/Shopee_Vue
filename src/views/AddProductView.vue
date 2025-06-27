<template>
  <div class="add-product-container">
    <div class="add-product-card">
      <div class="add-product-header">
        <h1 class="add-product-title">เพิ่มสินค้าใหม่</h1>
      </div>

      <form @submit.prevent="submitForm" class="add-product-form">
        <div class="form-layout">
          <!-- Left Column: Image Uploader -->
          <div class="form-column-left">
            <div class="form-group">
              <label class="form-label">รูปภาพสินค้า</label>
              <label class="file-uploader" for="file-upload">
                <input id="file-upload" type="file" accept="image/*" @change="onFileChange" required class="file-uploader-input">
                <div v-if="!previewImage" class="uploader-content">
                  <div class="file-uploader-icon">🖼️</div>
                  <div class="file-uploader-text">คลิกเพื่ออัปโหลดรูปภาพ</div>
                </div>
                <div v-else class="image-preview">
                  <img :src="previewImage" alt="Image Preview" class="preview-image" />
                </div>
              </label>
            </div>
          </div>

          <!-- Right Column: Form Fields -->
          <div class="form-column-right">
            <!-- Product Name -->
            <div class="form-group">
              <label for="product-name" class="form-label">ชื่อสินค้า</label>
              <input id="product-name" type="text" v-model="form.product_name" required class="form-input">
            </div>

            <!-- Price and Amount -->
            <div class="form-row">
              <div class="form-group">
                <label for="price" class="form-label">ราคา (บาท)</label>
                <input id="price" type="number" v-model.number="form.price" step="0.01" required min="0" class="form-input">
              </div>
              <div class="form-group">
                <label for="amount" class="form-label">จำนวน</label>
                <input id="amount" type="number" v-model.number="form.amount" required min="0" class="form-input">
              </div>
            </div>

            <!-- Description -->
            <div class="form-group">
              <label for="description" class="form-label">รายละเอียดสินค้า</label>
              <textarea id="description" v-model="form.description" rows="4" class="form-textarea"></textarea>
            </div>
          </div>
        </div>
        
        <!-- Submit Button -->
        <button type="submit" class="submit-btn">บันทึกสินค้า</button>
      </form>

      <!-- Success/Error Messages -->
      <div v-if="result" :class="['result-message', result.success ? 'success' : 'error']">
        <h3>{{ result.success ? 'อัปโหลดสำเร็จ!' : 'เกิดข้อผิดพลาด' }}</h3>
        <p>{{ result.message }}</p>
      </div>
      <div v-if="errorMessage" class="result-message error">
        <h3>เกิดข้อผิดพลาด</h3>
        <p>{{ errorMessage }}</p>
      </div>

    </div>
  </div>
</template>

<script>
import "@/styles/add-product.css"; // Import the new CSS

export default {
  name: "AddProductView",
  data() {
    return {
      form: {
        product_name: "",
        price: null,
        amount: null,
        description: "",
        image: null
      },
      previewImage: null,
      result: null,
      errorMessage: ""
    };
  },
  methods: {
    onFileChange(e) {
      const file = e.target.files[0];
      if (file) {
        this.form.image = file;
        const reader = new FileReader();
        reader.onload = (event) => {
          this.previewImage = event.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.form.image = null;
        this.previewImage = null;
      }
    },
    async submitForm() {
      this.result = null;
      this.errorMessage = "";

      const formData = new FormData();
      formData.append('image', this.form.image);
      formData.append('product_name', this.form.product_name);
      formData.append('price', this.form.price);
      formData.append('amount', this.form.amount);
      formData.append('description', this.form.description);

      try {
        const response = await fetch('http://localhost:3000/products', {
          method: 'POST',
          body: formData
        });
        
        const resultData = await response.json();
        this.result = resultData;

        if (resultData.success) {
          // Reset form and preview
          this.form = {
            product_name: "",
            price: null,
            amount: null,
            description: "",
            image: null
          };
          this.previewImage = null;
          // Optionally, clear the file input
          document.getElementById('file-upload').value = '';

          // Show success message for a few seconds, then maybe redirect
          setTimeout(() => {
            this.result = null;
            // this.$router.push('/products'); // Optional: redirect to products page
          }, 3000);

        } else {
           // Keep form data for user to correct
        }

      } catch (error) {
        this.errorMessage = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง";
      }
    }
  }
};
</script>