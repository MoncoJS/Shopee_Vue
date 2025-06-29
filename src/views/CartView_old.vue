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
        <div v-else-if="mergedItems.length === 0" class="empty-cart">
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
              >
                <!-- Product Image -->
                <div class="item-image">
                  <img
                    v-if="getProductInfo(item.product).img"
                    :src="getProductImg(getProductInfo(item.product).img)"
                    :alt="getProductInfo(item.product).name || getProductInfo(item.product).product_name || 'ไม่มีชื่อสินค้า'"
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
                    {{ getProductInfo(item.product).name || getProductInfo(item.product).product_name }}
                  </h3>
                  <p class="item-price">฿{{ formatPrice(item.price) }} / ชิ้น</p>
                  
                  <!-- Quantity Controls -->
                  <div class="quantity-section">
                    <div class="quantity-controls">
                      <button 
                        @click="decreaseQty(item)" 
                        class="qty-btn"
                        :disabled="item.quantity <= 1"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 13H5v-2h14v2z"/>
                        </svg>
                      </button>
                      <span class="qty-display">{{ item.quantity }}</span>
                      <button 
                        @click="increaseQty(item)" 
                        class="qty-btn"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
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
                  <button @click="applyCoupon" class="apply-coupon-btn">ใช้</button>
                </div>
                <div v-if="appliedCoupon" class="applied-coupon">
                  <div class="coupon-success">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    <span>ใช้โค้ด {{ appliedCoupon.code }} แล้ว!</span>
                  </div>
                </div>
              </div>

              <!-- Price Breakdown -->
              <div class="price-breakdown">
                <div class="price-row">
                  <span>ราคาสินค้า</span>
                  <span>฿{{ formatPrice(totalPrice) }}</span>
                </div>
                <div v-if="appliedCoupon" class="price-row discount">
                  <span>ส่วนลด</span>
                  <span>-฿{{ formatPrice(discountAmount) }}</span>
                </div>
                <div class="price-row shipping">
                  <span>ค่าจัดส่ง</span>
                  <span class="free-shipping">ฟรี</span>
                </div>
                <div class="price-row total">
                  <span>ยอดรวมทั้งสิ้น</span>
                  <span>฿{{ formatPrice(appliedCoupon ? finalPrice : totalPrice) }}</span>
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
                  :disabled="checkoutLoading"
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
            </table>
          </div>
          <div class="cart-summary">
            <div class="coupon-section mb-4">
              <input
                type="text"
                v-model="couponCode"
                placeholder="Enter coupon code"
                class="input input-bordered w-full max-w-xs mr-2"
              />
              <button @click="applyCoupon" class="btn btn-secondary">Apply Coupon</button>
              <div v-if="appliedCoupon" class="text-green-600 mt-2">Coupon {{ appliedCoupon.code }} applied!</div>
            </div>
            <button 
              @click="clearCart" 
              :disabled="clearingCart"
              class="btn cart-clear-btn"
            >
              <span v-if="clearingCart" class="loader" style="margin-right:8px"></span>
              ล้างตะกร้า
            </button>
            <div class="cart-total">
              ราคารวม: <span>{{ formatPrice(totalPrice) }}</span> บาท
            </div>
            <div v-if="appliedCoupon" class="cart-discount text-red-500">
              ส่วนลด: -<span>{{ formatPrice(discountAmount) }}</span> บาท
            </div>
            <div v-if="appliedCoupon" class="cart-final-total font-bold text-lg">
              ราคาสุทธิ: <span>{{ formatPrice(finalPrice) }}</span> บาท
            </div>
          </div>
          <div class="cart-actions">
            <router-link to="/products"
              class="btn cart-back-btn">
              กลับไปเลือกสินค้า
            </router-link>
            <button
              @click="checkout"
              :disabled="checkoutLoading"
              class="btn btn-gradient cart-checkout-btn"
            >
              <span v-if="checkoutLoading" class="loader" style="margin-right:8px"></span>
              <span>สั่งซื้อ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "@/styles/cart.css"
import CartViewModel from '../viewmodels/CartViewModel.js'
export default {
  name: 'CartView',
  mixins: [CartViewModel],
  data() {
    return {
      checkoutLoading: false,
      clearingCart: false,
      removingItems: []
    }
  },
  methods: {
    getProductImg(img) {
      if (!img) return '';
      if (/^https?:\/\//.test(img)) return img;
      const baseUrl = process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000';
      // If img already starts with /uploads/, use it directly, otherwise add the prefix
      if (img.startsWith('/uploads/')) {
        return `${baseUrl}${img}`;
      }
      return `${baseUrl}/uploads/${img}`;
    },
    onImgError(event) {
      // แสดง placeholder ถ้ารูปโหลดไม่ได้
      event.target.style.display = 'none';
      const placeholder = event.target.parentElement.querySelector('.cart-img-placeholder');
      if (placeholder) {
        placeholder.style.display = 'inline-block';
      }
    },
    onImgLoad(event) {
      // ซ่อน placeholder เมื่อรูปโหลดสำเร็จ
      const placeholder = event.target.parentElement.querySelector('.cart-img-placeholder');
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
      
      this.removingItems.push(itemId);
      try {
        await this.$options.mixins[0].methods.removeItem.call(this, item);
      } finally {
        this.removingItems = this.removingItems.filter(id => id !== itemId);
      }
    },
    async clearCart() {
      if (this.clearingCart) return;
      
      this.clearingCart = true;
      try {
        await this.$options.mixins[0].methods.clearCart.call(this);
      } finally {
        this.clearingCart = false;
      }
    },
    async checkout() {
      if (this.checkoutLoading) return;
      this.checkoutLoading = true;
      try {
        await this.$options.mixins[0].methods.checkout.call(this);
        window.location.reload();
      } finally {
        this.checkoutLoading = false;
      }
    }
  }
}
</script>