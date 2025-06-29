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
              <path
                d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <input v-model="search" type="search" placeholder="ค้นหาสินค้าที่คุณต้องการ..." class="search-input"
              @keyup.enter="onSearch" />
            <button v-if="search" @click="clearSearch" class="clear-search">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
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
            <span v-if="selectedCategory" class="category-term">หมวดหมู่ "{{ getCategoryName(selectedCategory) }}"</span>
          </div>

          <div class="filter-actions">
            <select v-model="selectedCategory" class="category-select">
              <option value="">ทุกหมวดหมู่ ({{ products.length }})</option>
              <option value="electronics">อิเล็กทรอนิกส์ ({{ categoryCount.electronics || 0 }})</option>
              <option value="clothing">เสื้อผ้า ({{ categoryCount.clothing || 0 }})</option>
              <option value="books">หนังสือ ({{ categoryCount.books || 0 }})</option>
              <option value="sports">กีฬา ({{ categoryCount.sports || 0 }})</option>
              <option value="home">บ้านและสวน ({{ categoryCount.home || 0 }})</option>
              <option value="beauty">ความงาม ({{ categoryCount.beauty || 0 }})</option>
              <option value="food">อาหารและเครื่องดื่ม ({{ categoryCount.food || 0 }})</option>
              <option value="toys">ของเล่น ({{ categoryCount.toys || 0 }})</option>
              <option value="automotive">ยานยนต์ ({{ categoryCount.automotive || 0 }})</option>
              <option value="other">อื่นๆ ({{ categoryCount.other || 0 }})</option>
            </select>
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
          <p v-if="search && selectedCategory">
            ไม่พบสินค้าที่ตรงกับ "{{ search }}" ในหมวดหมู่ "{{ getCategoryName(selectedCategory) }}"
          </p>
          <p v-else-if="search">
            ไม่พบสินค้าที่ตรงกับ "{{ search }}"
          </p>
          <p v-else-if="selectedCategory">
            ไม่มีสินค้าในหมวดหมู่ "{{ getCategoryName(selectedCategory) }}"
          </p>
          <p v-else>ยังไม่มีสินค้าในระบบ</p>
          <div class="empty-actions">
            <button v-if="search || selectedCategory" @click="clearAllFilters" class="clear-search-btn">
              ล้างตัวกรอง
            </button>
          </div>
        </div>

        <!-- Products Grid -->
        <div v-else class="products-grid">
          <div v-for="product in sortedProducts" :key="product._id" class="product-card"
            :class="{ 'out-of-stock': product.amount <= 0 }" @click="showProductDetail(product)">
            <!-- Product Image -->
            <div class="product-image-container">
              <img v-if="product.img" :src="getProductImg(product.img)" :alt="product.product_name"
                class="product-image" @error="onImgError" @load="onImgLoad" loading="lazy" />
              <div v-else class="product-image-placeholder">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
                <span>ไม่มีรูปภาพ</span>
              </div>

              <!-- Stock Badge -->
              <div v-if="product.amount <= 0" class="stock-badge out-of-stock">หมดสต๊อก</div>
              <div v-else-if="product.amount <= 5" class="stock-badge low-stock">เหลือน้อย</div>

              <!-- Admin Actions -->
              <div v-if="isAdmin" class="admin-actions" @click.stop>
                <router-link :to="{ name: 'edit_product', params: { id: product._id } }" class="admin-btn edit-btn"
                  title="แก้ไขสินค้า">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                </router-link>
                <button @click="deleteProduct(product)" class="admin-btn delete-btn" title="ลบสินค้า"
                  :disabled="isDeletingProduct === product._id">
                  <svg v-if="isDeletingProduct === product._id" class="loading-icon" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.3" />
                    <path fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                  </svg>
                </button>
              </div>

              <!-- View Detail Overlay -->
              <div class="detail-overlay">
                <div class="detail-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                  </svg>
                  <span>ดูรายละเอียด</span>
                </div>
              </div>
            </div>

            <!-- Product Info -->
            <div class="product-info">
              <h3 class="product-name">{{ product.product_name }}</h3>
              <div v-if="product.category" class="product-category">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C20.11,11 21,11.89 21,13V14C21,15.11 20.11,16 19,16H18V13A6,6 0 0,0 12,7A6,6 0 0,0 6,13V16H5C3.89,16 3,15.11 3,14V13C3,11.89 3.89,11 5,11H6V5A6,6 0 0,1 12,-1A6,6 0 0,1 18,5V11H19Z" />
                </svg>
                <span>{{ getCategoryName(product.category) }}</span>
              </div>
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
              <div class="cart-section" @click.stop>
                <div class="quantity-controls" v-if="product.amount > 0">
                  <button @click="decreaseQuantity(product._id)" :disabled="getQuantity(product._id) <= 1"
                    class="qty-btn">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13H5v-2h14v2z" />
                    </svg>
                  </button>
                  <input type="number" min="1" :max="product.amount" :value="getQuantity(product._id)"
                    @input="setQuantity(product._id, $event.target.value)" class="qty-input"
                    @change="validateQuantity(product)" />
                  <button @click="increaseQuantity(product._id, product.amount)"
                    :disabled="getQuantity(product._id) >= product.amount" class="qty-btn">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                  </button>
                </div>

                <button class="add-to-cart-btn"
                  :disabled="product.amount <= 0 || getQuantity(product._id) > product.amount || isAddingToCart === product._id"
                  @click="addToCart(product)">
                  <svg v-if="isAddingToCart === product._id" class="loading-icon" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.3" />
                    <path fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
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

    <!-- Product Detail Modal -->
    <div v-if="showProductModal" class="modal-overlay" @click="closeProductModal">
      <div class="product-modal" @click.stop>
        <div class="modal-header">
          <h3>รายละเอียดสินค้า</h3>
          <button @click="closeProductModal" class="close-btn">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <div v-if="selectedProduct" class="modal-body">
          <div class="product-detail-content">
            <!-- Product Image Section -->
            <div class="product-detail-image">
              <div class="main-image">
                <img v-if="selectedProduct.img" :src="getProductImg(selectedProduct.img)"
                  :alt="selectedProduct.product_name" class="detail-image" @error="onImgError" />
                <div v-else class="detail-image-placeholder">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                  <p>ไม่มีรูปภาพ</p>
                </div>
              </div>

              <!-- Stock Status -->
              <div class="stock-status">
                <div v-if="selectedProduct.amount <= 0" class="status-badge out-of-stock">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  หมดสต๊อก
                </div>
                <div v-else-if="selectedProduct.amount <= 5" class="status-badge low-stock">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                  </svg>
                  เหลือน้อย ({{ selectedProduct.amount }} ชิ้น)
                </div>
                <div v-else class="status-badge in-stock">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  พร้อมส่ง ({{ selectedProduct.amount }} ชิ้น)
                </div>
              </div>
            </div>

            <!-- Product Details Section -->
            <div class="product-detail-info">
              <div class="product-title-section">
                <h2 class="detail-product-name">{{ selectedProduct.product_name }}</h2>
                <div class="product-price-large">
                  <span class="price-currency">฿</span>
                  <span class="price-amount">{{ formatPrice(selectedProduct.price) }}</span>
                  <span class="price-unit">/ ชิ้น</span>
                </div>
              </div>

              <!-- Product Description -->
              <div class="product-description-section">
                <h4>รายละเอียดสินค้า</h4>
                <div class="description-content">
                  <p v-if="selectedProduct.description" class="full-description">
                    {{ selectedProduct.description }}
                  </p>
                  <p v-else class="no-description">
                    ไม่มีรายละเอียดสินค้า
                  </p>
                </div>
              </div>

              <!-- Product Info Grid -->
              <div class="product-info-grid">
                <div class="info-item">
                  <div class="info-label">หมวดหมู่</div>
                  <div class="info-value">{{ getCategoryName(selectedProduct.category) }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">จำนวนคงเหลือ</div>
                  <div class="info-value">{{ selectedProduct.amount }} ชิ้น</div>
                </div>
                <div class="info-item">
                  <div class="info-label">ราคาต่อหน่วย</div>
                  <div class="info-value">฿{{ formatPrice(selectedProduct.price) }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">สถานะ</div>
                  <div class="info-value">
                    <span :class="selectedProduct.amount > 0 ? 'text-success' : 'text-danger'">
                      {{ selectedProduct.amount > 0 ? 'พร้อมขาย' : 'หมดสต๊อก' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Actions Section -->
              <div class="modal-actions">
                <div v-if="selectedProduct.amount > 0" class="quantity-section-modal">
                  <label class="quantity-label">จำนวน:</label>
                  <div class="quantity-controls-modal">
                    <button @click="decreaseModalQuantity" :disabled="modalQuantity <= 1" class="qty-btn-modal">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 13H5v-2h14v2z" />
                      </svg>
                    </button>
                    <input type="number" min="1" :max="selectedProduct.amount" v-model.number="modalQuantity"
                      class="qty-input-modal" />
                    <button @click="increaseModalQuantity" :disabled="modalQuantity >= selectedProduct.amount"
                      class="qty-btn-modal">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div class="action-buttons">
                  <button v-if="selectedProduct.amount > 0" @click="addToCartFromModal"
                    :disabled="isAddingToCart === selectedProduct._id" class="add-to-cart-modal-btn">
                    <svg v-if="isAddingToCart === selectedProduct._id" class="loading-icon" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.3" />
                      <path fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="currentColor">
                      <path
                        d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                    <span v-if="isAddingToCart === selectedProduct._id">กำลังเพิ่มลงตะกร้า...</span>
                    <span v-else>เพิ่มลงตะกร้า</span>
                  </button>

                  <button v-else class="out-of-stock-btn" disabled>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    สินค้าหมด
                  </button>

                  <button @click="closeProductModal" class="close-modal-btn">
                    ปิด
                  </button>
                </div>
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
      selectedCategory: '',
      sortBy: 'default',
      isAddingToCart: null,
      isDeletingProduct: null,
      // Ensure products is always an array
      products: [],
      // Track quantities for each product - always initialize as object
      quantities: {},
      // Product detail modal
      showProductModal: false,
      selectedProduct: null,
      modalQuantity: 1
    }
  },
  computed: {
    ...mapGetters(['isAdmin']),
    filteredProducts() {
      if (!this.products || !Array.isArray(this.products)) return []
      
      let filtered = [...this.products]
      
      // Filter by search term
      if (this.search) {
        const s = this.search.trim().toLowerCase()
        filtered = filtered.filter(p =>
          (p.product_name || '').toLowerCase().includes(s) ||
          (p.description || '').toLowerCase().includes(s) ||
          this.getCategoryName(p.category || '').toLowerCase().includes(s)
        )
      }
      
      // Filter by category
      if (this.selectedCategory) {
        filtered = filtered.filter(p => 
          (p.category || '').toLowerCase() === this.selectedCategory.toLowerCase()
        )
      }
      
      return filtered
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
    },
    categoryCount() {
      if (!this.products || !Array.isArray(this.products)) return {}
      
      const count = {}
      this.products.forEach(product => {
        const category = product.category || 'other'
        count[category] = (count[category] || 0) + 1
      })
      return count
    },
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
    clearAllFilters() {
      this.search = ''
      this.selectedCategory = ''
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
    },

    async deleteProduct(product) {
      // Confirm deletion
      const confirmed = confirm(`คุณต้องการลบสินค้า "${product.product_name}" หรือไม่?\n\nการดำเนินการนี้ไม่สามารถยกเลิกได้`);
      if (!confirmed) return;

      this.isDeletingProduct = product._id;

      try {
        const api = require('@/services/api').default;
        const response = await api.delete(`/products/${product._id}`);

        if (response.data.success) {
          // Remove product from local array
          this.products = this.products.filter(p => p._id !== product._id);
          this.$notify.success(`ลบสินค้า "${product.product_name}" เรียบร้อยแล้ว`);
        } else {
          throw new Error(response.data.message || 'ไม่สามารถลบสินค้าได้');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        this.$notify.error('เกิดข้อผิดพลาดในการลบสินค้า');
      } finally {
        this.isDeletingProduct = null;
      }
    },

    // Product detail modal methods
    showProductDetail(product) {
      this.selectedProduct = product;
      this.modalQuantity = 1;
      this.showProductModal = true;
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    },

    closeProductModal() {
      this.showProductModal = false;
      this.selectedProduct = null;
      this.modalQuantity = 1;
      // Restore body scroll
      document.body.style.overflow = '';
    },

    increaseModalQuantity() {
      if (this.selectedProduct && this.modalQuantity < this.selectedProduct.amount) {
        this.modalQuantity++;
      }
    },

    decreaseModalQuantity() {
      if (this.modalQuantity > 1) {
        this.modalQuantity--;
      }
    },

    async addToCartFromModal() {
      if (!this.selectedProduct || this.isAddingToCart === this.selectedProduct._id) return;

      // Set the quantity for this product
      this.setQuantity(this.selectedProduct._id, this.modalQuantity);

      try {
        await this.addToCart(this.selectedProduct);
        this.$notify.success(`เพิ่ม "${this.selectedProduct.product_name}" ลงตะกร้าแล้ว (${this.modalQuantity} ชิ้น)`);
        this.closeProductModal();
      } catch (error) {
        console.error('Error adding to cart from modal:', error);
        this.$notify.error('เกิดข้อผิดพลาดในการเพิ่มสินค้าลงตะกร้า');
      }
    },

    getCategoryName(category) {
      const categoryMap = {
        'electronics': 'อิเล็กทรอนิกส์',
        'clothing': 'เสื้อผ้า',
        'books': 'หนังสือ',
        'sports': 'กีฬา',
        'home': 'บ้านและสวน',
        'beauty': 'ความงาม',
        'food': 'อาหารและเครื่องดื่ม',
        'toys': 'ของเล่น',
        'automotive': 'ยานยนต์',
        'other': 'อื่นๆ'
      };
      return categoryMap[category] || category || 'ทั่วไป';
    },
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

.category-term {
  color: #666;
  font-style: italic;
}

.filter-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.category-select,
.sort-select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  color: #333;
  cursor: pointer;
  transition: border-color 0.2s;
  min-width: 150px;
}

.category-select:focus,
.sort-select:focus {
  outline: none;
  border-color: #ee4d2d;
}

.category-select {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.empty-actions {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.loading-state,
.error-state,
.empty-state {
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
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.error-icon,
.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-btn,
.clear-search-btn {
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

.retry-btn:hover,
.clear-search-btn:hover {
  background: #d63918;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  padding: 1rem 0;
}

.product-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.product-image-container {
  position: relative;
  height: 250px;
  overflow: hidden;
  background: #f8f9fa;
  cursor: pointer;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-image-container:hover .product-image {
  transform: scale(1.05);
}

.product-image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
  background: #f3f4f6;
}

.product-image-placeholder svg {
  width: 48px;
  height: 48px;
  margin-bottom: 8px;
  opacity: 0.5;
}

.product-image-placeholder span {
  font-size: 14px;
  font-weight: 500;
}

.admin-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  z-index: 10;
}

.admin-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.edit-btn {
  background: rgba(34, 197, 94, 0.9);
  color: white;
  text-decoration: none;
}

.edit-btn:hover {
  background: rgba(34, 197, 94, 1);
  transform: scale(1.1);
}

.delete-btn {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 1);
  transform: scale(1.1);
}

.admin-btn svg {
  width: 18px;
  height: 18px;
}

.product-info {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  line-height: 1.4;
  cursor: pointer;
  transition: color 0.2s ease;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-name:hover {
  color: #ee4d2d;
}

.product-category {
  margin: 4px 0 0 0;
}

.category-tag {
  background: #f0f9ff;
  color: #0284c7;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #e0f2fe;
}

.product-price {
  margin: 8px 0;
}

.price {
  font-size: 24px;
  font-weight: 700;
  color: #ee4d2d;
}

.product-stock {
  margin-bottom: 16px;
}

.stock {
  font-size: 14px;
  color: #6b7280;
}

.stock.low-stock {
  color: #f59e0b;
  font-weight: 500;
}

.stock.out-of-stock {
  color: #ef4444;
  font-weight: 500;
}

.add-to-cart-btn {
  width: 100%;
  background: #ee4d2d;
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: auto;
}

.add-to-cart-btn:hover:not(:disabled) {
  background: #d73d2d;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(238, 77, 45, 0.3);
}

.add-to-cart-btn:disabled {
  background: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.add-to-cart-btn svg {
  width: 20px;
  height: 20px;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.stock-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 3;
}

.stock-badge.out-of-stock {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
  animation: pulse 2s infinite;
}

.stock-badge.low-stock {
  background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
  color: #333;
  animation: bounce 2s infinite;
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

@keyframes bounce {

  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }

  40% {
    transform: translateY(-3px);
  }

  60% {
    transform: translateY(-2px);
  }
}

.admin-actions {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  display: flex;
  gap: 0.5rem;
  z-index: 3;
}

.admin-btn {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  text-decoration: none;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.admin-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.admin-btn.edit-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.admin-btn.delete-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.admin-btn.delete-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: scale(1.1);
}

.admin-btn.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.admin-btn svg {
  width: 18px;
  height: 18px;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.product-info {
  padding: 1.5rem;
  background: white;
  position: relative;
  z-index: 2;
  flex-grow: 1;
  /* Take up remaining space in flex container */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #1a1a1a;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}

.product-card:hover .product-name {
  color: #ee4d2d;
}

.product-category {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #666;
  border: 1px solid #e9ecef;
  width: fit-content;
}

.product-category svg {
  width: 16px;
  height: 16px;
  color: #ee4d2d;
}

.product-category span {
  color: #555;
}

.product-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.6;
  opacity: 0.9;
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

/* Product Detail Modal Styles */
.product-card {
  cursor: pointer;
  position: relative;
}

.detail-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 16px;
}

.product-card:hover .detail-overlay {
  opacity: 1;
}

.detail-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  text-align: center;
  pointer-events: none;
}

.detail-btn svg {
  width: 32px;
  height: 32px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.product-modal {
  background: white;
  border-radius: 20px;
  max-width: 900px;
  width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border-radius: 20px 20px 0 0;
}

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background 0.2s;
  color: #6b7280;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.close-btn svg {
  width: 24px;
  height: 24px;
}

.modal-body {
  padding: 2rem;
}

.product-detail-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

.product-detail-image {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.main-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 16px;
  overflow: hidden;
  background: #f8f9fa;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.detail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.detail-image:hover {
  transform: scale(1.05);
}

.detail-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
}

.detail-image-placeholder svg {
  width: 64px;
  height: 64px;
  margin-bottom: 1rem;
}

.stock-status {
  display: flex;
  justify-content: center;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
}

.status-badge.in-stock {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #065f46;
}

.status-badge.low-stock {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
}

.status-badge.out-of-stock {
  background: linear-gradient(135deg, #fecaca, #fca5a5);
  color: #991b1b;
}

.status-badge svg {
  width: 18px;
  height: 18px;
}

.product-detail-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.product-title-section {
  text-align: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.detail-product-name {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 1rem 0;
  line-height: 1.3;
}

.product-price-large {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.25rem;
}

.price-currency {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ee4d2d;
}

.price-amount {
  font-size: 2.5rem;
  font-weight: 800;
  color: #ee4d2d;
  background: linear-gradient(135deg, #ee4d2d, #ff6b35);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.price-unit {
  font-size: 1rem;
  color: #6b7280;
  font-weight: 500;
}

.product-description-section h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.75rem 0;
}

.description-content {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 12px;
  border-left: 4px solid #ee4d2d;
}

.full-description {
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
}

.no-description {
  color: #9ca3af;
  font-style: italic;
  margin: 0;
}

.product-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.info-item {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.info-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.info-value {
  font-size: 0.95rem;
  color: #374151;
  font-weight: 600;
}

.text-success {
  color: #059669;
}

.text-danger {
  color: #dc2626;
}

.modal-actions {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  margin-top: 1rem;
}

.quantity-section-modal {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.quantity-label {
  font-weight: 600;
  color: #374151;
}

.quantity-controls-modal {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border-radius: 8px;
  padding: 0.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.qty-btn-modal {
  width: 36px;
  height: 36px;
  border: none;
  background: #f3f4f6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.qty-btn-modal:hover:not(:disabled) {
  background: #ee4d2d;
  color: white;
}

.qty-btn-modal:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-btn-modal svg {
  width: 18px;
  height: 18px;
}

.qty-input-modal {
  width: 60px;
  text-align: center;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.add-to-cart-modal-btn {
  flex: 1;
  max-width: 300px;
  background: linear-gradient(135deg, #ee4d2d, #ff6b35);
  color: white;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 20px rgba(238, 77, 45, 0.3);
}

.add-to-cart-modal-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(238, 77, 45, 0.4);
}

.add-to-cart-modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.add-to-cart-modal-btn svg {
  width: 20px;
  height: 20px;
}

.out-of-stock-btn {
  flex: 1;
  max-width: 300px;
  background: linear-gradient(135deg, #6b7280, #9ca3af);
  color: white;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: not-allowed;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.out-of-stock-btn svg {
  width: 20px;
  height: 20px;
}

.close-modal-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.close-modal-btn:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
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
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    /* Slightly larger minimum for better image display */
    gap: 1rem;
  }

  .filter-section {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .filter-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .category-select,
  .sort-select {
    min-width: 120px;
    flex: 1;
  }

  /* Modal responsive */
  .product-modal {
    width: 95%;
    max-height: 95vh;
    margin: 1rem;
  }

  .modal-header {
    padding: 1rem 1.5rem;
  }

  .modal-header h3 {
    font-size: 1.25rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .product-detail-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .detail-product-name {
    font-size: 1.5rem;
  }

  .price-amount {
    font-size: 2rem;
  }

  .product-info-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .add-to-cart-modal-btn,
  .out-of-stock-btn {
    max-width: none;
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

  /* Modal mobile */
  .modal-header {
    padding: 1rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .detail-product-name {
    font-size: 1.25rem;
  }

  .price-amount {
    font-size: 1.75rem;
  }

  .quantity-section-modal {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
