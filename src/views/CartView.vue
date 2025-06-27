<template>
  <div class="cart-bg">
    <header class="cart-header">
      <h2 class="cart-title">
        🛒 ตะกร้าสินค้า
      </h2>
    </header>
    <div class="cart-content">
      <div class="cart-container">
        <div v-if="loading" class="cart-loading">Loading...</div>
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <!-- แสดง empty cart UI -->
        <div v-else-if="mergedItems.length === 0" class="cart-empty">
          <div style="
            width: 110px;
            height: 110px;
            background: #c9e6a6;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 18px;
            position: relative;
          ">
            <!-- ถุงสินค้า SVG -->
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <circle cx="30" cy="30" r="30" fill="#c9e6a6"/>
              <rect x="18" y="26" width="24" height="18" rx="6" fill="#F7D07A"/>
              <path d="M24 34a6 6 0 0 0 12 0" stroke="#A3A3A3" stroke-width="2" fill="none"/>
              <rect x="30" y="40" width="8" height="4" rx="2" fill="#B7E0C0"/>
              <circle cx="24" cy="30" r="2" fill="#A3A3A3"/>
              <circle cx="36" cy="30" r="2" fill="#A3A3A3"/>
              <!-- รอยยิ้ม -->
              <path d="M26 38 Q30 42 34 38" stroke="#A3A3A3" stroke-width="2" fill="none"/>
            </svg>
            <!-- Tag -->
            <svg style="position:absolute; right:-14px; bottom:16px;" width="32" height="16" viewBox="0 0 32 16" fill="none">
              <rect x="0" y="4" width="22" height="8" rx="3" fill="#B7E0C0"/>
              <rect x="22" y="7" width="8" height="3" rx="1.5" fill="#F7D07A"/>
              <circle cx="4" cy="8" r="1.2" fill="#A3A3A3"/>
              <text x="10" y="11" font-size="6" fill="#7bbf8e">฿</text>
            </svg>
            <!-- Dots -->
            <span style="position:absolute; left:-12px; top:12px; width:7px; height:7px; background:#F7D07A; border-radius:50%;"></span>
            <span style="position:absolute; right:-7px; top:6px; width:5px; height:5px; background:#B7E0C0; border-radius:50%;"></span>
            <span style="position:absolute; left:18px; top:-10px; width:6px; height:6px; background:#fff; opacity:0.7; border-radius:50%;"></span>
          </div>
          <div class="cart-empty-text">ยังไม่มีสินค้าในรถเข็น</div>
        </div>
        <!-- ตารางสินค้า -->
        <div v-else>
          <div class="cart-table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>รูปสินค้า</th>
                  <th>ชื่อสินค้า</th>
                  <th>จำนวน</th>
                  <th>ราคา/ชิ้น</th>
                  <th>รวม</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in mergedItems" :key="getItemId(item)">
                  <td>
                    <img
                      v-if="getProductInfo(item.product).img"
                      :src="getProductImg(getProductInfo(item.product).img)"
                      :alt="getProductInfo(item.product).name || getProductInfo(item.product).product_name || 'ไม่มีชื่อสินค้า'"
                      class="cart-img"
                      @error="onImgError($event)"
                      @load="onImgLoad($event)"
                    />
                    <span v-else class="cart-img-placeholder">
                      🛍️
                    </span>
                  </td>
                  <td>
                    <span>{{ getProductInfo(item.product).name || getProductInfo(item.product).product_name }}</span>
                  </td>
                  <td>
                    <button @click="decreaseQty(item)" class="cart-qty-btn">-</button>
                    <span class="cart-qty">{{ item.quantity }}</span>
                    <button @click="increaseQty(item)" class="cart-qty-btn">+</button>
                  </td>
                  <td>{{ formatPrice(item.price) }}</td>
                  <td>{{ formatPrice(item.price * item.quantity) }}</td>
                  <td>
                    <button 
                      @click="removeItem(item)" 
                      :disabled="removingItems.includes(getItemId(item))"
                      class="cart-remove-btn"
                    >
                      <span v-if="removingItems.includes(getItemId(item))" class="loader" style="margin-right:4px"></span>
                      ลบ
                    </button>
                  </td>
                </tr>
              </tbody>
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
      // ตรวจสอบ path ว่าถูกต้องหรือไม่
      return `http://localhost:3000/uploads/${encodeURIComponent(img)}`;
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