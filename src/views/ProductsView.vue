<template>
  <div class="products-container">
    <!-- Header -->
    <div class="products-header">
      <h1 class="products-title">รายการสินค้า</h1>
      <div class="products-search-wrapper">
        <input
          v-model="search"
          type="search"
          placeholder="ค้นหาสินค้า..."
          class="products-search-input"
          @keyup.enter="onSearch"
        />
        <svg class="products-search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
      </div>
    </div>

    <!-- Loading and Error Messages -->
    <div v-if="loading" class="products-loading">กำลังโหลดข้อมูลสินค้า...</div>
    <div v-if="errorMessage" class="products-error-message">
      {{ errorMessage }}
    </div>

    <!-- Products Grid -->
    <div v-else class="products-grid">
      <div
        v-for="product in filteredProducts"
        :key="product._id"
        class="product-card"
      >
        <div class="product-image-container">
          <img
            v-if="product.img"
            :src="getProductImg(product.img)"
            :alt="product.product_name"
            class="product-image"
            @error="onImgError"
          />
          <div v-else class="product-image-placeholder">
            <span>🛍️</span>
          </div>
        </div>

        <div class="product-content">
          <h2 class="product-name">{{ product.product_name }}</h2>
          <p v-if="product.description" class="product-description">
            {{ product.description }}
          </p>
          
          <div class="product-details">
            <span class="product-price">฿{{ product.price.toLocaleString() }}</span>
            <span :class="['product-stock', { 'out-of-stock': product.amount <= 0 }]">
              {{ product.amount > 0 ? `มีสินค้า ${product.amount} ชิ้น` : 'สินค้าหมด' }}
            </span>
          </div>

          <div class="product-actions">
            <div class="quantity-control">
              <button @click="decreaseQuantity(product._id)" :disabled="!quantities[product._id] || quantities[product._id] <= 1">-</button>
              <input 
                type="number" 
                min="1" 
                :max="product.amount" 
                v-model.number="quantities[product._id]"
                class="quantity-input"
                :disabled="product.amount <= 0"
                @change="validateQuantity(product)"
              />
              <button @click="increaseQuantity(product._id, product.amount)" :disabled="product.amount <= 0 || quantities[product._id] >= product.amount">+</button>
            </div>
            <button
              class="add-to-cart-btn"
              :disabled="product.amount <= 0 || quantities[product._id] > product.amount"
              @click="addToCart(product)"
            >
              <span v-if="product.amount <= 0">สินค้าหมด</span>
              <span v-else>เพิ่มลงตะกร้า</span>
            </button>
            <router-link v-if="isAdmin" :to="{ name: 'edit_product', params: { id: product._id } }" class="btn edit-btn">
              แก้ไข
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import "@/styles/products.css"
import ProductsViewModel from '../viewmodels/ProductsViewModel.js'
import { mapGetters } from 'vuex';

export default {
  name: "ProductsView",
  mixins: [ProductsViewModel],
  data() {
    return {
      search: ''
    }
  },
  computed: {
    ...mapGetters(['isAdmin']),
    filteredProducts() {
      if (!this.search) return this.products
      const s = this.search.trim().toLowerCase()
      return this.products.filter(p =>
        (p.product_name || '').toLowerCase().includes(s)
      )
    }
  },
  methods: {
    onSearch() {
      // v-model + computed handles filtering automatically
    },
    getProductImg(img) {
      if (!img) return '';
      if (/^https?:\/\//.test(img)) return img;
      return `http://localhost:3000/uploads/${encodeURIComponent(img)}`;
    },
    onImgError(event) {
      const placeholder = event.target.parentElement.querySelector('.product-image-placeholder');
      if (placeholder) {
        placeholder.style.display = 'flex';
      }
      event.target.style.display = 'none';
    },
    increaseQuantity(productId, maxAmount) {
      if (this.quantities[productId] < maxAmount) {
        this.$set(this.quantities, productId, this.quantities[productId] + 1);
      }
    },
    decreaseQuantity(productId) {
      if (this.quantities[productId] > 1) {
        this.$set(this.quantities, productId, this.quantities[productId] - 1);
      }
    },
    validateQuantity(product) {
      const qty = this.quantities[product._id];
      if (qty > product.amount) {
        this.$set(this.quantities, product._id, product.amount);
      } else if (qty < 1) {
        this.$set(this.quantities, product._id, 1);
      }
    }
  }
}
</script>
