<template>
  <div class="products-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">ค้นพบสินค้าที่คุณต้องการ</h1>
        <p class="hero-subtitle">สินค้าคุณภาพดี ราคาดี จากร้านค้าที่เชื่อถือได้</p>
        
        <!-- Search Bar -->
        <div class="search-container">
          <div class="search-wrapper">
            <svg class="search-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              v-model="search"
              type="search"
              placeholder="ค้นหาสินค้าที่คุณต้องการ..."
              class="search-input"
              @keyup.enter="onSearch"
            />
            <button v-if="search" @click="clearSearch" class="clear-search">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div class="container">
        <!-- Filter and Sort Section -->
        <div class="filter-section">
          <div class="results-info">
            <span class="results-count">{{ (filteredProducts || []).length }} สินค้า</span>
            <span v-if="search" class="search-term">จากการค้นหา "{{ search }}"</span>
          </div>
          
          <div class="filter-actions">
            <select v-model="sortBy" class="sort-select">
              <option value="default">เรียงตาม</option>
              <option value="price-low">ราคา: ต่ำ → สูง</option>
              <option value="price-high">ราคา: สูง → ต่ำ</option>
              <option value="name">ชื่อสินค้า A-Z</option>
              <option value="stock">สินค้าในสต๊อก</option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>กำลังโหลดสินค้า...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="errorMessage" class="error-state">
          <div class="error-icon">⚠️</div>
          <h3>เกิดข้อผิดพลาด</h3>
          <p>{{ errorMessage }}</p>
          <button @click="fetchProducts" class="retry-btn">ลองใหม่อีกครั้ง</button>
        </div>

        <!-- Empty State -->
        <div v-else-if="(filteredProducts || []).length === 0" class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>ไม่พบสินค้า</h3>
          <p v-if="search">ไม่พบสินค้าที่ตรงกับ "{{ search }}"</p>
          <p v-else>ยังไม่มีสินค้าในระบบ</p>
          <button v-if="search" @click="clearSearch" class="clear-search-btn">ล้างการค้นหา</button>
        </div>

        <!-- Products Grid -->
        <div v-else class="products-grid">
          <div
            v-for="product in sortedProducts"
            :key="product._id"
            class="product-card"
            :class="{ 'out-of-stock': product.amount <= 0 }"
          >
            <!-- Product Image -->
            <div class="product-image-container">
              <img
                v-if="product.img"
                :src="getProductImg(product.img)"
                :alt="product.product_name"
                class="product-image"
                @error="onImgError"
                @load="onImgLoad"
                loading="lazy"
              />
              <div v-else class="product-image-placeholder">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
              </div>
              
              <!-- Stock Badge -->
              <div v-if="product.amount <= 0" class="stock-badge out-of-stock">หมดสต๊อก</div>
              <div v-else-if="product.amount <= 5" class="stock-badge low-stock">เหลือน้อย</div>
              
              <!-- Admin Actions -->
              <div v-if="isAdmin" class="admin-actions">
                <router-link 
                  :to="{ name: 'edit_product', params: { id: product._id } }" 
                  class="admin-btn edit-btn"
                  title="แก้ไขสินค้า"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                </router-link>
              </div>
            </div>

            <!-- Product Info -->
            <div class="product-info">
              <h3 class="product-name">{{ product.product_name }}</h3>
              <p v-if="product.description" class="product-description">
                {{ truncateText(product.description, 80) }}
              </p>
              
              <div class="product-price-section">
                <span class="product-price">฿{{ formatPrice(product.price) }}</span>
                <span class="product-stock">
                  {{ product.amount > 0 ? `คงเหลือ ${product.amount} ชิ้น` : 'สินค้าหมด' }}
                </span>
              </div>

              <!-- Add to Cart Section -->
              <div class="cart-section">
                <div class="quantity-controls" v-if="product.amount > 0">
                  <button 
                    @click="decreaseQuantity(product._id)" 
                    :disabled="getQuantity(product._id) <= 1"
                    class="qty-btn"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13H5v-2h14v2z"/>
                    </svg>
                  </button>
                  <input 
                    type="number" 
                    min="1" 
                    :max="product.amount" 
                    :value="getQuantity(product._id)"
                    @input="setQuantity(product._id, $event.target.value)"
                    class="qty-input"
                    @change="validateQuantity(product)"
                  />
                  <button 
                    @click="increaseQuantity(product._id, product.amount)" 
                    :disabled="getQuantity(product._id) >= product.amount"
                    class="qty-btn"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                  </button>
                </div>

                <button
                  class="add-to-cart-btn"
                  :disabled="product.amount <= 0 || getQuantity(product._id) > product.amount || isAddingToCart === product._id"
                  @click="addToCart(product)"
                >
                  <svg v-if="isAddingToCart === product._id" class="loading-icon" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.3"/>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                  <span v-if="product.amount <= 0">สินค้าหมด</span>
                  <span v-else-if="isAddingToCart === product._id">กำลังเพิ่ม...</span>
                  <span v-else>เพิ่มลงตะกร้า</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import ProductsViewModel from '../viewmodels/ProductsViewModel.js'
import { mapGetters } from 'vuex';

export default {
  name: "ProductsView",
  mixins: [ProductsViewModel],
  data() {
    return {
      search: '',
      sortBy: 'default',
      isAddingToCart: null,
      // Ensure products is always an array
      products: [],
      // Track quantities for each product - always initialize as object
      quantities: {}
    }
  },
  computed: {
    ...mapGetters(['isAdmin']),
    filteredProducts() {
      if (!this.products || !Array.isArray(this.products)) return []
      if (!this.search) return this.products
      const s = this.search.trim().toLowerCase()
      return this.products.filter(p =>
        (p.product_name || '').toLowerCase().includes(s) ||
        (p.description || '').toLowerCase().includes(s)
      )
    },
    sortedProducts() {
      const products = [...this.filteredProducts]
      
      switch (this.sortBy) {
        case 'price-low':
          return products.sort((a, b) => a.price - b.price)
        case 'price-high':
          return products.sort((a, b) => b.price - a.price)
        case 'name':
          return products.sort((a, b) => (a.product_name || '').localeCompare(b.product_name || ''))
        case 'stock':
          return products.sort((a, b) => b.amount - a.amount)
        default:
          return products
      }
    }
  },
  async created() {
    // Fetch products when component is created (including when navigating back)
    if (this.$options.mixins[0].methods.fetchProducts) {
      await this.$options.mixins[0].methods.fetchProducts.call(this);
    }
  },
  async beforeRouteEnter(to, from, next) {
    next(async vm => {
      // Refresh products when entering this route
      if (vm.$options.mixins[0].methods.fetchProducts) {
        await vm.$options.mixins[0].methods.fetchProducts.call(vm);
      }
    });
  },
  watch: {
    products: {
      handler(newProducts) {
        if (newProducts && Array.isArray(newProducts)) {
          // Initialize quantities for all products
          const quantities = { ...this.quantities }; // Preserve existing quantities
          newProducts.forEach(product => {
            if (product && product._id && !quantities[product._id]) {
              quantities[product._id] = 1;
            }
          });
          this.quantities = quantities;
        }
      },
      immediate: true
    }
  },
  methods: {
    onSearch() {
      // v-model + computed handles filtering automatically
    },
    clearSearch() {
      this.search = ''
    },
    getProductImg(img) {
      if (!img) return '';
      if (/^https?:\/\//.test(img)) return img;
      
      const baseUrl = process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000';
      
      // Clean the img path
      let cleanImg = img.replace(/^\/+/, '').replace(/^uploads\//, '');
      
      // Use the new image endpoint that handles CORS properly
      return `${baseUrl}/products/image/${encodeURIComponent(cleanImg)}`;
    },
    onImgError(event) {
      const placeholder = event.target.parentElement.querySelector('.product-image-placeholder');
      if (placeholder) {
        placeholder.style.display = 'flex';
      }
      event.target.style.display = 'none';
    },
    onImgLoad(event) {
      const placeholder = event.target.parentElement.querySelector('.product-image-placeholder');
      if (placeholder) {
        placeholder.style.display = 'none';
      }
    },
    increaseQuantity(productId, maxAmount) {
      const currentQty = this.getQuantity(productId);
      if (currentQty < maxAmount) {
        this.setQuantity(productId, currentQty + 1);
      }
    },
    decreaseQuantity(productId) {
      const currentQty = this.getQuantity(productId);
      if (currentQty > 1) {
        this.setQuantity(productId, currentQty - 1);
      }
    },
    getQuantity(productId) {
      return this.quantities[productId] || 1;
    },
    setQuantity(productId, value) {
      const qty = parseInt(value) || 1;
      this.$set(this.quantities, productId, Math.max(1, qty));
    },
    validateQuantity(product) {
      const qty = this.getQuantity(product._id);
      if (qty > product.amount) {
        this.setQuantity(product._id, product.amount);
      } else if (qty < 1) {
        this.setQuantity(product._id, 1);
      }
    },
    async addToCart(product) {
      if (this.isAddingToCart === product._id) return;
      
      this.isAddingToCart = product._id;
      try {
        const quantity = this.getQuantity(product._id);
        await this.$options.mixins[0].methods.addToCart.call(this, product, quantity);
        // Show success feedback
        this.$notify.success('เพิ่มสินค้าลงตะกร้าแล้ว');
      } catch (error) {
        this.$notify.error('เกิดข้อผิดพลาดในการเพิ่มสินค้า');
      } finally {
        this.isAddingToCart = null;
      }
    },
    formatPrice(price) {
      return price.toLocaleString('th-TH');
    },
    truncateText(text, length) {
      if (!text) return '';
      return text.length > length ? text.substring(0, length) + '...' : text;
    },
    async fetchProducts() {
      // Call the mixin method to retry fetching products
      if (this.$options.mixins[0].methods.fetchProducts) {
        await this.$options.mixins[0].methods.fetchProducts.call(this);
      }
    }
  }
}
</script>

<style scoped>
.products-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8f9fa, #ffffff);
}

.hero-section {
  background: linear-gradient(135deg, #ee4d2d 0%, #ff6b35 100%);
  color: white;
  padding: 3rem 0;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><radialGradient id="a" cx="50%" cy="0%" r="100%"><stop offset="0%" stop-color="white" stop-opacity="0.1"/><stop offset="100%" stop-color="white" stop-opacity="0"/></radialGradient></defs><rect width="100" height="20" fill="url(%23a)"/></svg>');
  pointer-events: none;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.search-container {
  max-width: 600px;
  margin: 0 auto;
}

.search-wrapper {
  position: relative;
  background: white;
  border-radius: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #666;
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: none;
  outline: none;
  font-size: 1rem;
  background: transparent;
  color: #333;
}

.search-input::placeholder {
  color: #999;
}

.clear-search {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: background 0.2s;
}

.clear-search:hover {
  background: #f0f0f0;
}

.clear-search svg {
  width: 16px;
  height: 16px;
  color: #666;
}

.main-content {
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.results-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.results-count {
  font-weight: 600;
  color: #333;
}

.search-term {
  color: #666;
  font-style: italic;
}

.filter-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.sort-select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  color: #333;
  cursor: pointer;
  transition: border-color 0.2s;
}

.sort-select:focus {
  outline: none;
  border-color: #ee4d2d;
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
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
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-btn, .clear-search-btn {
  background: #ee4d2d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
  margin-top: 1rem;
}

.retry-btn:hover, .clear-search-btn:hover {
  background: #d63918;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.product-card.out-of-stock {
  opacity: 0.7;
}

.product-image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
  background: #f8f9fa;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.product-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  color: #999;
}

.product-image-placeholder svg {
  width: 48px;
  height: 48px;
}

.stock-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.stock-badge.out-of-stock {
  background: #dc3545;
  color: white;
}

.stock-badge.low-stock {
  background: #ffc107;
  color: #333;
}

.admin-actions {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  display: flex;
  gap: 0.5rem;
}

.admin-btn {
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  text-decoration: none;
}

.admin-btn:hover {
  background: rgba(0, 0, 0, 0.9);
}

.admin-btn svg {
  width: 16px;
  height: 16px;
}

.product-info {
  padding: 1rem;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

.product-price-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.product-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ee4d2d;
}

.product-stock {
  font-size: 0.85rem;
  color: #666;
}

.cart-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.qty-btn:hover:not(:disabled) {
  border-color: #ee4d2d;
  color: #ee4d2d;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-btn svg {
  width: 16px;
  height: 16px;
}

.qty-input {
  width: 60px;
  text-align: center;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
}

.qty-input:focus {
  border-color: #ee4d2d;
}

.add-to-cart-btn {
  width: 100%;
  padding: 0.75rem;
  background: #ee4d2d;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.add-to-cart-btn:hover:not(:disabled) {
  background: #d63918;
  transform: translateY(-1px);
}

.add-to-cart-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.add-to-cart-btn svg {
  width: 16px;
  height: 16px;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }

  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-actions {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .hero-content {
    padding: 0 0.5rem;
  }

  .products-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .product-card {
    margin: 0 0.5rem;
  }
}
</style>
