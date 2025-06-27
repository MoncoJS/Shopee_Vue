<template>
  <div class="edit-product-container">
    <div class="edit-product-card">
      <div class="edit-product-header">
        <h1 class="edit-product-title">แก้ไขสินค้า</h1>
      </div>

      <div v-if="loading" class="loading-message">กำลังโหลดข้อมูลสินค้า...</div>
      <div v-else-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <form v-else @submit.prevent="submitForm" class="edit-product-form">
        <div class="form-layout">
          <!-- Left Column: Image Uploader -->
          <div class="form-column-left">
            <div class="form-group">
              <label class="form-label">รูปภาพสินค้า</label>
              <label class="file-uploader" for="file-upload">
                <input id="file-upload" type="file" accept="image/*" @change="onFileChange" class="file-uploader-input">
                <div v-if="!previewImage" class="uploader-content">
                  <div class="file-uploader-icon">🖼️</div>
                  <div class="file-uploader-text">คลิกเพื่ออัปโหลดรูปภาพใหม่</div>
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
        
        <!-- Action Buttons -->
        <div class="action-buttons">
          <button type="submit" class="btn btn-primary save-btn">บันทึกการเปลี่ยนแปลง</button>
          <button type="button" @click="confirmDelete" class="btn btn-danger delete-btn">ลบสินค้า</button>
        </div>
      </form>

      <!-- Result/Error Messages -->
      <div v-if="result" :class="['result-message', result.success ? 'success' : 'error']">
        <h3>{{ result.success ? 'ดำเนินการสำเร็จ!' : 'เกิดข้อผิดพลาด' }}</h3>
        <p>{{ result.message }}</p>
      </div>

    </div>
  </div>
</template>

<script>
import "@/styles/edit-product.css";
import EditProductViewModel from '../viewmodels/EditProductViewModel.js';

export default {
  name: "EditProductView",
  mixins: [EditProductViewModel],
  data() {
    return {
      form: {
        product_name: "",
        price: null,
        amount: null,
        description: "",
        image: null,
        existing_image: null, // To store the current image URL
      },
      previewImage: null,
      loading: true,
      errorMessage: "",
      result: null,
    };
  },
  created() {
    this.fetchProduct();
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
        this.previewImage = this.form.existing_image; // Revert to existing image if no new file selected
      }
    },
    async fetchProduct() {
      this.loading = true;
      this.errorMessage = "";
      try {
        const productId = this.$route.params.id;
        const response = await fetch(`http://localhost:3000/products/${productId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const product = await response.json();
        this.form.product_name = product.product_name;
        this.form.price = product.price;
        this.form.amount = product.amount;
        this.form.description = product.description;
        this.form.existing_image = this.getProductImg(product.img); // Store original image URL
        this.previewImage = this.form.existing_image;
      } catch (error) {
        this.errorMessage = "ไม่สามารถโหลดข้อมูลสินค้าได้: " + error.message;
      } finally {
        this.loading = false;
      }
    },
    getProductImg(img) {
      if (!img) return '';
      if (/^https?:\/\//.test(img)) return img;
      return `http://localhost:3000/uploads/${encodeURIComponent(img)}`;
    },
    async submitForm() {
      this.result = null;
      this.errorMessage = "";
      const productId = this.$route.params.id;
      const formData = new FormData();
      formData.append('product_name', this.form.product_name);
      formData.append('price', this.form.price);
      formData.append('amount', this.form.amount);
      formData.append('description', this.form.description);
      if (this.form.image) {
        formData.append('image', this.form.image);
      }

      try {
        const response = await fetch(`http://localhost:3000/products/${productId}`, {
          method: 'PUT',
          body: formData
        });
        
        const resultData = await response.json();
        this.result = resultData;

        if (resultData.success) {
          // Update existing_image if a new image was uploaded
          if (this.form.image) {
            this.form.existing_image = this.previewImage; // Assuming previewImage is the new URL
          }
          this.form.image = null; // Clear the file input
          document.getElementById('file-upload').value = '';

          // Fetch updated product data to refresh the form
          await this.fetchProduct();

          setTimeout(() => {
            this.result = null;
          }, 3000);

        } else {
           // Keep form data for user to correct
        }

      } catch (error) {
        this.errorMessage = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ หรือเกิดข้อผิดพลาดในการอัปเดต";
      }
    },
    async confirmDelete() {
      if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?")) {
        await this.deleteProduct();
      }
    },
    async deleteProduct() {
      this.result = null;
      this.errorMessage = "";
      const productId = this.$route.params.id;

      try {
        const response = await fetch(`http://localhost:3000/products/${productId}`, {
          method: 'DELETE',
        });
        
        const resultData = await response.json();
        this.result = resultData;

        if (resultData.success) {
          alert("สินค้าถูกลบเรียบร้อยแล้ว!");
          this.$router.push('/products'); // Redirect to products list
        } else {
           // Show error message
        }

      } catch (error) {
        this.errorMessage = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ หรือเกิดข้อผิดพลาดในการลบ";
      }
    }
  }
};
</script>