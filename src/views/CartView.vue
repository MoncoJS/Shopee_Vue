<template>
  <div class="cart-page">
    <!-- Header -->
    <div class="cart-header">
      <div class="container">
        <h1 class="cart-title">
          <svg class="cart-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
          ตะกร้าสินค้าของฉัน
        </h1>
        <div class="breadcrumb">
          <router-link to="/products" class="breadcrumb-link">สินค้า</router-link>
          <span class="breadcrumb-separator">›</span>
          <span class="breadcrumb-current">ตะกร้าสินค้า</span>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="cart-content">
      <div class="container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>กำลังโหลดตะกร้าสินค้า...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="errorMessage" class="error-state">
          <div class="error-icon">⚠️</div>
          <h3>เกิดข้อผิดพลาด</h3>
          <p>{{ errorMessage }}</p>
          <button @click="fetchCartItems" class="retry-btn">ลองใหม่อีกครั้ง</button>
        </div>

        <!-- Empty Cart -->
        <div v-else-if="!loading && mergedItems.length === 0" class="empty-cart">
          <div class="empty-cart-illustration">
            <svg viewBox="0 0 200 160" fill="none">
              <!-- Cart -->
              <rect x="60" y="80" width="80" height="50" rx="8" fill="#f0f0f0" stroke="#ddd" stroke-width="2"/>
              <circle cx="75" cy="145" r="8" fill="#ddd"/>
              <circle cx="125" cy="145" r="8" fill="#ddd"/>
              <path d="M45 60h20l15 30h60l10-25" stroke="#ddd" stroke-width="3" fill="none"/>
              
              <!-- Empty indicators -->
              <circle cx="100" cy="105" r="15" fill="#fff" stroke="#ddd" stroke-width="2" stroke-dasharray="5,5"/>
              <text x="100" y="110" text-anchor="middle" fill="#999" font-size="12">ว่าง</text>
            </svg>
          </div>
          <h3 class="empty-title">ตะกร้าสินค้าของคุณยังว่างอยู่</h3>
          <p class="empty-message">เริ่มเลือกซื้อสินค้าที่คุณชื่นชอบกันเถอะ!</p>
          <router-link to="/products" class="shop-now-btn">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 7h-4V6a3 3 0 0 0-6 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM11 6a1 1 0 0 1 2 0v1h-2V6zm4 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h2v1a1 1 0 0 0 2 0V9h2v10z"/>
            </svg>
            เริ่มช้อปปิ้ง
          </router-link>
        </div>

        <!-- Cart Items -->
        <div v-else class="cart-layout">
          <!-- Items List -->
          <div class="cart-items-section">
            <div class="section-header">
              <div class="select-all-section">
                <label class="checkbox-container">
                  <input 
                    type="checkbox" 
                    v-model="selectAll" 
                    @change="toggleSelectAll"
                  >
                  <span class="checkmark"></span>
                  เลือกทั้งหมด
                </label>
                <span class="selected-count" v-if="selectedItemsCount > 0">
                  (เลือกแล้ว {{ selectedItemsCount }} รายการ)
                </span>
              </div>
              <h2>สินค้าในตะกร้า ({{ mergedItems.length }} รายการ)</h2>
              <button 
                @click="clearCart" 
                :disabled="clearingCart"
                class="clear-all-btn"
              >
                <svg v-if="clearingCart" class="loading-icon" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.3"/>
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
                <span>ล้างทั้งหมด</span>
              </button>
            </div>

            <div class="cart-items">
              <div 
                v-for="item in mergedItems" 
                :key="getItemId(item)"
                class="cart-item"
                :class="{ 'selected': isItemSelected(item) }"
              >
                <!-- Checkbox -->
                <div class="item-checkbox">
                  <label class="checkbox-container">
                    <input 
                      type="checkbox" 
                      :checked="isItemSelected(item)"
                      @change="toggleItemSelection(item)"
                    >
                    <span class="checkmark"></span>
                  </label>
                </div>

                <!-- Product Image -->
                <div class="item-image">
                  <img
                    v-if="getProductInfo(item).img"
                    :src="getProductImg(getProductInfo(item).img)"
                    :alt="getProductInfo(item).name || 'ไม่มีชื่อสินค้า'"
                    class="product-img"
                    @error="onImgError($event)"
                    @load="onImgLoad($event)"
                    loading="lazy"
                  />
                  <div v-else class="img-placeholder">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                    </svg>
                  </div>
                </div>

                <!-- Product Details -->
                <div class="item-details">
                  <h3 class="item-name">
                    {{ getProductInfo(item).name }}
                  </h3>
                  <p class="item-price">฿{{ formatPrice(item.price) }} / ชิ้น</p>
                  
                  <!-- Quantity Controls -->
                  <div class="quantity-section">
                    <div class="quantity-controls">
                      <button 
                        @click="decreaseQty(item)" 
                        class="qty-btn"
                        :disabled="item.quantity <= 1 || updatingItems.includes(getItemId(item))"
                      >
                        <svg v-if="updatingItems.includes(getItemId(item))" class="loading-icon" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.3"/>
                          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        <svg v-else viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 13H5v-2h14v2z"/>
                        </svg>
                      </button>
                      <span class="qty-display">{{ item.quantity }}</span>
                      <button 
                        @click="increaseQty(item)" 
                        class="qty-btn"
                        :disabled="updatingItems.includes(getItemId(item))"
                      >
                        <svg v-if="updatingItems.includes(getItemId(item))" class="loading-icon" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.3"/>
                          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        <svg v-else viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                      </button>
                    </div>
                    
                    <div class="item-total">
                      <span class="total-label">รวม:</span>
                      <span class="total-price">฿{{ formatPrice(item.price * item.quantity) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Remove Button -->
                <button 
                  @click="removeItem(item)" 
                  :disabled="removingItems.includes(getItemId(item))"
                  class="remove-btn"
                  title="ลบสินค้า"
                >
                  <svg v-if="removingItems.includes(getItemId(item))" class="loading-icon" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.3"/>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="order-summary-section">
            <div class="order-summary">
              <h3 class="summary-title">สรุปคำสั่งซื้อ</h3>
              
              <!-- Coupon Section -->
              <div class="coupon-section">
                <h4>โค้ดส่วนลด</h4>
                <div class="coupon-input-group">
                  <input
                    type="text"
                    v-model="couponCode"
                    placeholder="ใส่โค้ดส่วนลด"
                    class="coupon-input"
                  />
                  <button @click="applyCoupon" :disabled="couponLoading || !couponCode.trim()" class="apply-coupon-btn">
                    <span v-if="couponLoading">รอสักครู่...</span>
                    <span v-else>ใช้</span>
                  </button>
                </div>
                <div v-if="appliedCoupon" class="applied-coupon">
                  <div class="coupon-success">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    <span>ใช้โค้ด {{ appliedCoupon.code }} แล้ว!</span>
                    <button @click="removeCoupon" class="remove-coupon-btn">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Price Breakdown -->
              <div class="price-breakdown">
                <div v-if="!hasSelectedItems" class="no-selection-message">
                  <p>กรุณาเลือกสินค้าที่ต้องการสั่งซื้อ</p>
                </div>
                <div v-else>
                  <div class="selected-items-summary">
                    <p>สินค้าที่เลือก: {{ selectedItemsCount }} รายการ</p>
                  </div>
                  <div class="price-row">
                    <span>ราคาสินค้า</span>
                    <span>฿{{ formatPrice(selectedTotalPrice) }}</span>
                  </div>
                  <div v-if="appliedCoupon" class="price-row discount">
                    <span>ส่วนลด</span>
                    <span>-฿{{ formatPrice(discountAmount) }}</span>
                  </div>
                  <div class="price-row shipping">
                    <span>ค่าจัดส่ง</span>
                    <span class="free-shipping">ฟรี</span>
                  </div>
                </div>
                <div class="price-row total">
                  <span>ยอดรวมทั้งสิ้น</span>
                  <span>฿{{ formatPrice(hasSelectedItems ? (appliedCoupon ? finalPrice : selectedTotalPrice) : 0) }}</span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="action-buttons">
                <router-link to="/products" class="continue-shopping-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                  </svg>
                  เลือกซื้อสินค้าต่อ
                </router-link>
                
                <button
                  @click="checkout"
                  :disabled="checkoutLoading || !hasSelectedItems"
                  class="checkout-btn"
                >
                  <svg v-if="checkoutLoading" class="loading-icon" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.3"/>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span v-if="checkoutLoading">กำลังสั่งซื้อ...</span>
                  <span v-else-if="!hasSelectedItems">เลือกสินค้าก่อน</span>
                  <span v-else>สั่งซื้อตอนนี้</span>
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
import CartViewModel from '../viewmodels/CartViewModel.js'

export default {
  name: 'CartView',
  mixins: [CartViewModel],
  data() {
    return {
      checkoutLoading: false,
      clearingCart: false,
      removingItems: [],
      updatingItems: [], // Track items being updated
      couponCode: '',
      appliedCoupon: null,
      couponLoading: false,
      selectedItems: {}, // Track which items are selected for checkout
      selectAll: false
    }
  },
  watch: {
    mergedItems: {
      handler(newItems) {
        // Auto-select new items that are added to cart
        if (newItems && newItems.length > 0) {
          newItems.forEach(item => {
            const itemId = this.getItemId(item);
            if (!Object.prototype.hasOwnProperty.call(this.selectedItems, itemId)) {
              this.$set(this.selectedItems, itemId, true);
            }
          });
          this.updateSelectAllState();
        }
      },
      immediate: true
    }
  },
  methods: {
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
      // แสดง placeholder ถ้ารูปโหลดไม่ได้
      event.target.style.display = 'none';
      const placeholder = event.target.parentElement.querySelector('.img-placeholder');
      if (placeholder) {
        placeholder.style.display = 'flex';
      }
    },
    onImgLoad(event) {
      // ซ่อน placeholder เมื่อรูปโหลดสำเร็จ
      const placeholder = event.target.parentElement.querySelector('.img-placeholder');
      if (placeholder) {
        placeholder.style.display = 'none';
      }
    },
    formatPrice(val) {
      if (typeof val !== 'number') return val;
      return val.toLocaleString('th-TH', { minimumFractionDigits: 0 });
    },
    async removeItem(item) {
      const itemId = this.getItemId(item);
      if (this.removingItems.includes(itemId)) return;
      
      // Get product info for confirmation message
      const productInfo = this.getProductInfo(item);
      const productName = productInfo.name || productInfo.product_name || 'สินค้านี้';
      
      // Show confirmation dialog
      if (!confirm(`คุณต้องการลบ "${productName}" ออกจากตะกร้าหรือไม่?`)) {
        return;
      }
      
      this.removingItems.push(itemId);
      try {
        await this.$options.mixins[0].methods.removeItem.call(this, item);
        
        // Remove from selected items if it was selected
        this.$delete(this.selectedItems, itemId);
        this.updateSelectAllState();
        
        this.$notify.success(`ลบ "${productName}" ออกจากตะกร้าแล้ว`);
      } catch (error) {
        console.error('Error removing item:', error);
        this.$notify.error('เกิดข้อผิดพลาดในการลบสินค้า');
      } finally {
        this.removingItems = this.removingItems.filter(id => id !== itemId);
      }
    },
    async clearCart() {
      if (this.clearingCart) return;
      
      if (!confirm('คุณต้องการล้างสินค้าทั้งหมดในตะกร้าหรือไม่?')) return;
      
      this.clearingCart = true;
      try {
        await this.$options.mixins[0].methods.clearCart.call(this);
        
        // Clear all selected items
        this.selectedItems = {};
        this.selectAll = false;
        
        this.$notify.success('ล้างตะกร้าสินค้าแล้ว');
      } catch (error) {
        this.$notify.error('เกิดข้อผิดพลาดในการล้างตะกร้า');
      } finally {
        this.clearingCart = false;
      }
    },

    async removeSelectedItems() {
      const selectedItems = this.getSelectedItems();
      if (selectedItems.length === 0) {
        this.$notify.warning('กรุณาเลือกสินค้าที่ต้องการลบ');
        return;
      }

      const confirmMessage = `คุณต้องการลบสินค้าที่เลือก ${selectedItems.length} รายการหรือไม่?`;
      if (!confirm(confirmMessage)) return;

      this.clearingCart = true;
      try {
        // Remove each selected item
        for (const item of selectedItems) {
          await this.$options.mixins[0].methods.removeItem.call(this, item);
        }

        // Clear selected items
        this.selectedItems = {};
        this.selectAll = false;

        this.$notify.success(`ลบสินค้า ${selectedItems.length} รายการแล้ว`);
      } catch (error) {
        console.error('Error removing selected items:', error);
        this.$notify.error('เกิดข้อผิดพลาดในการลบสินค้า');
      } finally {
        this.clearingCart = false;
      }
    },
    async checkout() {
      if (this.checkoutLoading) return;
      this.checkoutLoading = true;
      try {
        await this.$options.mixins[0].methods.checkout.call(this);
        this.$notify.success('สั่งซื้อสำเร็จ!');
        // Reload to refresh the cart
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error) {
        this.$notify.error('เกิดข้อผิดพลาดในการสั่งซื้อ');
      } finally {
        this.checkoutLoading = false;
      }
    },
    async fetchCartItems() {
      // Call the mixin method to retry fetching cart items
      if (this.$options.mixins[0].methods.fetchCartItems) {
        await this.$options.mixins[0].methods.fetchCartItems.call(this);
      }
    },
    async applyCoupon() {
      if (!this.couponCode.trim()) {
        this.$notify.error('กรุณากรอกรหัสคูปอง');
        return;
      }

      if (this.couponLoading) return;
      
      this.couponLoading = true;
      try {
        const api = require('@/services/api').default;
        const response = await api.get(`/coupons/code/${this.couponCode.trim()}`);
        
        if (response.data.success) {
          const coupon = response.data.data;
          
          // Check if coupon is active
          if (!coupon.isActive) {
            this.$notify.error('คูปองนี้ไม่สามารถใช้งานได้');
            return;
          }
          
          // Check if coupon is expired
          if (new Date(coupon.expirationDate) < new Date()) {
            this.$notify.error('คูปองนี้หมดอายุแล้ว');
            return;
          }
          
          this.appliedCoupon = coupon;
          this.couponCode = '';
          this.$notify.success(`ใช้คูปอง ${coupon.code} สำเร็จ!`);
        } else {
          this.$notify.error('ไม่พบคูปองนี้');
        }
      } catch (error) {
        console.error('Error applying coupon:', error);
        this.$notify.error('เกิดข้อผิดพลาดในการใช้คูปอง');
      } finally {
        this.couponLoading = false;
      }
    },
    removeCoupon() {
      this.appliedCoupon = null;
      this.$notify.success('ยกเลิกการใช้คูปองแล้ว');
    },
    
    // Checkbox functionality
    isItemSelected(item) {
      const itemId = this.getItemId(item);
      return !!this.selectedItems[itemId];
    },
    
    toggleItemSelection(item) {
      const itemId = this.getItemId(item);
      if (this.selectedItems[itemId]) {
        this.$delete(this.selectedItems, itemId);
      } else {
        this.$set(this.selectedItems, itemId, true);
      }
      this.updateSelectAllState();
    },
    
    toggleSelectAll() {
      if (this.selectAll) {
        // Select all items
        this.mergedItems.forEach(item => {
          const itemId = this.getItemId(item);
          this.$set(this.selectedItems, itemId, true);
        });
      } else {
        // Deselect all items
        this.selectedItems = {};
      }
    },
    
    updateSelectAllState() {
      const allSelected = this.mergedItems.length > 0 && 
                         this.mergedItems.every(item => this.isItemSelected(item));
      this.selectAll = allSelected;
    },
    
    getItemId(item) {
      return item.product_id || item._id || item.id;
    },

    // Quantity management methods
    async increaseQty(item) {
      const itemId = this.getItemId(item);
      if (this.updatingItems.includes(itemId)) return;
      
      this.updatingItems.push(itemId);
      try {
        const newQuantity = item.quantity + 1;
        
        // Update in backend first
        await this.updateItemQuantity(item, newQuantity);
        
        // Refresh cart data to get updated quantities
        await this.fetchCartItems();
        
        this.$notify.success('เพิ่มจำนวนสินค้าแล้ว');
      } catch (error) {
        console.error('Error increasing quantity:', error);
        this.$notify.error('เกิดข้อผิดพลาดในการเพิ่มจำนวนสินค้า');
      } finally {
        this.updatingItems = this.updatingItems.filter(id => id !== itemId);
      }
    },

    async decreaseQty(item) {
      if (item.quantity <= 1) return;
      
      const itemId = this.getItemId(item);
      if (this.updatingItems.includes(itemId)) return;
      
      this.updatingItems.push(itemId);
      try {
        const newQuantity = item.quantity - 1;
        
        // Update in backend first
        await this.updateItemQuantity(item, newQuantity);
        
        // Refresh cart data to get updated quantities
        await this.fetchCartItems();
        
        this.$notify.success('ลดจำนวนสินค้าแล้ว');
      } catch (error) {
        console.error('Error decreasing quantity:', error);
        this.$notify.error('เกิดข้อผิดพลาดในการลดจำนวนสินค้า');
      } finally {
        this.updatingItems = this.updatingItems.filter(id => id !== itemId);
      }
    },

    async updateItemQuantity(item, newQuantity) {
      const api = require('@/services/api').default;
      
      // The current structure has orders with items array
      // We need to find which order contains this item and update it
      
      try {
        // First, get all orders to find which one contains this item
        const ordersResponse = await api.get('/orders/');
        if (!ordersResponse.data.success) {
          throw new Error('ไม่สามารถดึงข้อมูล orders ได้');
        }
        
        const orders = ordersResponse.data.data || [];
        let targetOrder = null;
        let itemIndex = -1;
        
        // Find the order and item index
        for (const order of orders) {
          if (order.items && Array.isArray(order.items)) {
            itemIndex = order.items.findIndex(orderItem => {
              const productId = orderItem.product._id || orderItem.product;
              const itemProductId = item.product._id || item.product;
              return productId === itemProductId && orderItem.price === item.price;
            });
            
            if (itemIndex !== -1) {
              targetOrder = order;
              break;
            }
          }
        }
        
        if (!targetOrder || itemIndex === -1) {
          throw new Error('ไม่พบสินค้าในตะกร้า');
        }
        
        // Update the specific item quantity
        const updatedItems = [...targetOrder.items];
        updatedItems[itemIndex].quantity = newQuantity;
        
        // Update the entire order
        const response = await api.put('/orders/', {
          items: updatedItems
        });
        
        if (!response.data.success) {
          throw new Error(response.data.message || 'ไม่สามารถอัปเดตจำนวนสินค้าได้');
        }
        
        return response.data;
        
      } catch (error) {
        console.error('Error updating item quantity:', error);
        throw error;
      }
    },
  },
  computed: {
    // ...existing computed properties...
    discountAmount() {
      if (!this.appliedCoupon) return 0;
      
      if (this.appliedCoupon.discountType === 'percentage') {
        return (this.selectedTotalPrice * this.appliedCoupon.discountValue) / 100;
      } else {
        return Math.min(this.appliedCoupon.discountValue, this.selectedTotalPrice);
      }
    },
    finalPrice() {
      return Math.max(0, this.selectedTotalPrice - this.discountAmount);
    },
    selectedItemsList() {
      return this.mergedItems.filter(item => this.isItemSelected(item));
    },
    selectedItemsCount() {
      return this.selectedItemsList.length;
    },
    selectedTotalPrice() {
      return this.selectedItemsList.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
    },
    hasSelectedItems() {
      return this.selectedItemsCount > 0;
    }
  }
}
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8f9fa, #ffffff);
}

.cart-header {
  background: linear-gradient(135deg, #ee4d2d 0%, #ff6b35 100%);
  color: white;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.cart-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.cart-icon {
  width: 32px;
  height: 32px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.9;
}

.breadcrumb-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: white;
}

.breadcrumb-separator {
  margin: 0 0.25rem;
}

.breadcrumb-current {
  color: white;
  font-weight: 500;
}

.cart-content {
  padding: 2rem 0;
}

.loading-state, .error-state {
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
  font-weight: 500;
  transition: background 0.2s;
  margin-top: 1rem;
}

.retry-btn:hover {
  background: #d63918;
}

.empty-cart {
  text-align: center;
  padding: 4rem 1rem;
}

.empty-cart-illustration {
  margin-bottom: 2rem;
}

.empty-cart-illustration svg {
  width: 200px;
  height: 160px;
  max-width: 100%;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
}

.empty-message {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.shop-now-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #ee4d2d;
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(238, 77, 45, 0.3);
}

.shop-now-btn:hover {
  background: #d63918;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(238, 77, 45, 0.4);
}

.shop-now-btn svg {
  width: 20px;
  height: 20px;
}

.cart-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  align-items: start;
}

.cart-items-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.clear-all-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.clear-all-btn:hover:not(:disabled) {
  background: #c82333;
}

.clear-all-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.clear-all-btn svg {
  width: 16px;
  height: 16px;
}

/* Section Header */
.section-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.select-all-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.selected-count {
  color: #666;
  font-size: 0.9rem;
}

/* Checkbox Styles */
.checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.checkbox-container input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkbox-container .checkmark {
  height: 20px;
  width: 20px;
  background-color: #fff;
  border: 2px solid #ddd;
  border-radius: 4px;
  position: relative;
  transition: all 0.2s;
}

.checkbox-container:hover input ~ .checkmark {
  border-color: #ee4d2d;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: #ee4d2d;
  border-color: #ee4d2d;
}

.checkbox-container .checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 6px;
  top: 2px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.cart-items {
  padding: 0;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s;
}

.cart-item:hover {
  background: #fafafa;
}

.cart-item.selected {
  background: #fff5f5;
  border-left: 4px solid #ee4d2d;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-checkbox {
  flex-shrink: 0;
}

.item-image {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  position: relative;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  background: #f8f9fa;
}

.img-placeholder {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.img-placeholder svg {
  width: 32px;
  height: 32px;
}

.item-details {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-price {
  color: #666;
  margin-bottom: 0.75rem;
}

.quantity-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
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

.qty-display {
  min-width: 40px;
  text-align: center;
  font-weight: 600;
  padding: 0.5rem;
}

.item-total {
  text-align: right;
}

.total-label {
  display: block;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.total-price {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ee4d2d;
}

.remove-btn {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.remove-btn:hover:not(:disabled) {
  background: #c82333;
}

.remove-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.remove-btn svg {
  width: 18px;
  height: 18px;
}

.order-summary-section {
  position: sticky;
  top: 2rem;
}

.order-summary {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.summary-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1.5rem;
}

.coupon-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.coupon-section h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
}

.coupon-input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.coupon-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s;
}

.coupon-input:focus {
  border-color: #ee4d2d;
}

.apply-coupon-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
  white-space: nowrap;
}

.apply-coupon-btn:hover:not(:disabled) {
  background: #218838;
}

.apply-coupon-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.applied-coupon {
  margin-top: 0.75rem;
}

.coupon-success {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #28a745;
  font-size: 0.9rem;
  font-weight: 500;
}

.coupon-success svg {
  width: 16px;
  height: 16px;
}

.remove-coupon-btn {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.2s;
  margin-left: auto;
}

.remove-coupon-btn:hover {
  background: rgba(220, 53, 69, 0.1);
}

.remove-coupon-btn svg {
  width: 14px;
  height: 14px;
}

.price-breakdown {
  margin-bottom: 1.5rem;
}

.no-selection-message {
  text-align: center;
  padding: 2rem;
  color: #666;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.no-selection-message p {
  margin: 0;
  font-size: 0.95rem;
}

.selected-items-summary {
  background: #e8f5e8;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  border-left: 4px solid #28a745;
}

.selected-items-summary p {
  margin: 0;
  font-size: 0.9rem;
  color: #155724;
  font-weight: 500;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.price-row.discount {
  color: #28a745;
}

.price-row.shipping {
  border-bottom: 1px solid #eee;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
}

.free-shipping {
  color: #28a745;
  font-weight: 600;
}

.price-row.total {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  border-top: 2px solid #eee;
  padding-top: 0.75rem;
  margin-top: 0.75rem;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.continue-shopping-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 2px solid #ee4d2d;
  color: #ee4d2d;
  background: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
}

.continue-shopping-btn:hover {
  background: #ee4d2d;
  color: white;
}

.continue-shopping-btn svg {
  width: 18px;
  height: 18px;
}

.checkout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #ee4d2d;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(238, 77, 45, 0.3);
}

.checkout-btn:hover:not(:disabled) {
  background: #d63918;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(238, 77, 45, 0.4);
}

.checkout-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.checkout-btn svg {
  width: 18px;
  height: 18px;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .cart-layout {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .order-summary-section {
    position: static;
    order: -1;
  }

  .cart-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
  }

  .item-image {
    width: 100%;
    height: 200px;
  }

  .quantity-section {
    width: 100%;
    flex-direction: column;
    gap: 1rem;
  }

  .quantity-controls {
    justify-content: center;
  }

  .coupon-input-group {
    flex-direction: column;
  }

  .action-buttons {
    gap: 1rem;
  }

  .cart-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 0.75rem;
  }

  .cart-item {
    padding: 0.75rem;
  }

  .section-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .section-header h2 {
    text-align: center;
  }
}
</style>
