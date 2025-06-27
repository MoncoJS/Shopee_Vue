<template>
    <nav class="navbar">
        <div class="navbar-left">
            <a class="navbar-brand">
                <span>🛒</span>
                <span>Shopee</span>
            </a>
            <router-link to="/products" class="navbar-link">Product</router-link>
            <router-link v-if="isAdmin" to="/add_products" class="navbar-link">Add Product</router-link>
            <router-link v-if="isAdmin" to="/manage_users" class="navbar-link">Manage Users</router-link>
            <router-link v-if="isAdmin" to="/coupons" class="navbar-link">Manage Coupons</router-link>
        </div>
        <div class="navbar-right">
            <!-- Cart Dropdown -->
            <div class="navbar-cart-wrapper">
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
                        <span class="navbar-cart-count">{{ cartCount }} รายการ</span>
                        <span class="navbar-cart-total">รวมทั้งหมด: ฿{{ cartTotal }}</span>
                        <ul class="navbar-cart-list">
                            <li v-for="item in cartItems" :key="itemKey(item)"
                                class="navbar-cart-item">
                                <div class="navbar-cart-item-content">
                                    <img
                                        v-if="getProductInfo(item.product).img"
                                        :src="getProductImg(getProductInfo(item.product).img)"
                                        :alt="getProductInfo(item.product).name"
                                        class="navbar-cart-item-img"
                                        @error="onImgError($event)"
                                    />
                                    <span v-else class="navbar-cart-item-placeholder">🛍️</span>
                                    <span class="navbar-cart-item-name">{{ getProductName(item) }}</span>
                                </div>
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
            <!-- User Dropdown -->
            <div class="dropdown navbar-user-wrapper">
                <label tabindex="0" class="navbar-user">
                    <span class="navbar-user-icon">👤</span>
                    <span>{{ getUser ? getUser.username : 'Guest' }}</span>
                    <svg class="navbar-user-arrow" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </label>
                <ul tabindex="0" class="dropdown-menu">
                    <li v-if="!isLoggedIn">
                        <router-link to="/login" class="dropdown-link">Login</router-link>
                    </li>
                    <li v-else>
                        <router-link to="/profile" class="dropdown-link">Profile</router-link>
                        <button @click="logout" class="dropdown-link">Log out</button>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script>
import "@/styles/main.css"
import NavbarViewModel from '../viewmodels/NavbarViewModel.js'
import { mapGetters } from 'vuex'; // Remove mapActions

export default {
    name: 'AppNavbar',
    mixins: [NavbarViewModel],
    computed: {
        ...mapGetters(['isLoggedIn', 'isAdmin', 'getUser']),
        customerName() {
            return this.getUser ? this.getUser.username : 'Guest';
        }
    },
    methods: {
        // Remove ...mapActions(['logout']),
        async logout() {
            await this.$store.dispatch('logout');
            this.$router.push('/login');
        },
        onImgError(event) {
            // ซ่อนรูปและแสดง placeholder
            event.target.style.display = 'none';
            const placeholder = event.target.parentElement.querySelector('.navbar-cart-item-placeholder');
            if (placeholder) {
                placeholder.style.display = 'inline-block';
            }
        }
    }
}
</script>