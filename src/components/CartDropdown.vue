<template>
  <div class="dropdown">
    <div tabindex="0" role="button" class="navbar-cart-btn">
      <div class="navbar-cart-indicator">
        <svg xmlns="http://www.w3.org/2000/svg" class="navbar-cart-icon" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span class="navbar-cart-badge">{{ cartCount }}</span>
      </div>
    </div>
    <div tabindex="0" class="navbar-cart-dropdown">
      <div class="navbar-cart-body">
        <span class="navbar-cart-count">{{ cartCount }} Items</span>
        <span class="navbar-cart-total">รวมทั้งหมด: ฿{{ cartTotal }}</span>
        <ul class="navbar-cart-list">
          <li v-for="item in cartItems" :key="itemKey(item)" class="navbar-cart-item">
            <span class="navbar-cart-item-name">{{ getProductName(item) }}</span>
            <span class="navbar-cart-item-qty">x{{ item.quantity }}</span>
          </li>
          <li v-if="cartItems.length === 0" class="navbar-cart-empty">
            ไม่มีสินค้าในตะกร้า
          </li>
        </ul>
        <div class="navbar-cart-actions">
          <router-link to="/cart" class="btn btn-primary">View cart</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "@/styles/cart.css"
export default {
  name: 'CartDropdown',
  props: {
    cartItems: Array,
    cartCount: Number,
    cartTotal: Number,
    getProductName: Function,
    itemKey: Function
  }
}
</script>
