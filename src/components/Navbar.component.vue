<template>
  <nav class="navbar">
    <div class="navbar-container">
      <!-- Brand Logo -->
      <router-link to="/" class="navbar-brand">
        <div class="brand-icon">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="16" fill="#ee4d2d"/>
            <path d="M8 12h16l-2 8H10l-2-8z" fill="white"/>
            <circle cx="12" cy="24" r="2" fill="#ee4d2d"/>
            <circle cx="20" cy="24" r="2" fill="#ee4d2d"/>
          </svg>
        </div>
        <span class="brand-text">Shopee</span>
      </router-link>

      <!-- Mobile Menu Toggle -->
      <button 
        class="mobile-menu-toggle"
        @click="toggleMobileMenu"
        :class="{ 'active': mobileMenuOpen }"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- Navigation Links -->
      <div class="navbar-menu" :class="{ 'mobile-open': mobileMenuOpen }">
        <div class="navbar-nav">
          <router-link 
            to="/products" 
            class="nav-link"
            @click="closeMobileMenu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span>สินค้า</span>
          </router-link>

          <router-link 
            to="/cart" 
            class="nav-link cart-link"
            @click="closeMobileMenu"
          >
            <div class="cart-icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
              <span v-if="cartItemCount > 0" class="cart-badge">{{ cartItemCount }}</span>
            </div>
            <span>ตะกร้า</span>
          </router-link>

          <router-link 
            v-if="isAdmin" 
            to="/add_product" 
            class="nav-link"
            @click="closeMobileMenu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            <span>เพิ่มสินค้า</span>
          </router-link>

          <router-link 
            v-if="isAdmin" 
            to="/manage_users" 
            class="nav-link"
            @click="closeMobileMenu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-1c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v1h2v-1c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v1h2v2H4v-2z"/>
            </svg>
            <span>จัดการผู้ใช้</span>
          </router-link>

          <router-link 
            v-if="isAdmin" 
            to="/coupons" 
            class="nav-link"
            @click="closeMobileMenu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.79 21L3 11.21v2c0 .45.35.79.79.79h8.21l-.01-.79zM11.21 3H5c-.45 0-.79.35-.79.79v6.21l8.79 8.79L11.21 3z"/>
            </svg>
            <span>จัดการคูปอง</span>
          </router-link>
        </div>

        <!-- User Menu -->
        <div class="navbar-user">
          <div v-if="!isLoggedIn" class="auth-links">
            <router-link 
              to="/login" 
              class="nav-link login-link"
              @click="closeMobileMenu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <span>เข้าสู่ระบบ</span>
            </router-link>
            <router-link 
              to="/register" 
              class="nav-link register-link"
              @click="closeMobileMenu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <span>สมัครสมาชิก</span>
            </router-link>
          </div>

          <div v-else class="user-menu">
            <div class="user-dropdown" @click="toggleUserMenu" :class="{ 'open': userMenuOpen }">
              <div class="user-avatar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <span class="user-name">{{ userName }}</span>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="currentColor"
                class="dropdown-arrow"
              >
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </div>

            <div class="user-dropdown-menu" :class="{ 'open': userMenuOpen }">
              <router-link 
                to="/profile" 
                class="dropdown-item"
                @click="closeUserMenu"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                <span>โปรไฟล์</span>
              </router-link>
              <button 
                class="dropdown-item logout-btn"
                @click="logout"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import NavbarViewModel from '../viewmodels/NavbarViewModel.js'

export default {
  name: 'NavbarComponent',
  mixins: [NavbarViewModel],
  data() {
    return {
      mobileMenuOpen: false,
      userMenuOpen: false
    }
  },
  methods: {
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen
      this.userMenuOpen = false
    },
    closeMobileMenu() {
      this.mobileMenuOpen = false
    },
    toggleUserMenu() {
      this.userMenuOpen = !this.userMenuOpen
    },
    closeUserMenu() {
      this.userMenuOpen = false
      this.mobileMenuOpen = false
    },
    async logout() {
      try {
        await this.$store.dispatch('logout')
        this.closeUserMenu()
        this.$router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
        // Force logout even if API call fails
        this.closeUserMenu()
        this.$router.push('/login')
      }
    }
  },
  mounted() {
    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.$el.contains(e.target)) {
        this.mobileMenuOpen = false
        this.userMenuOpen = false
      }
    })
  }
}
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #ee4d2d 0%, #ff6b35 100%);
  box-shadow: 0 2px 20px rgba(238, 77, 45, 0.15);
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  transition: transform 0.2s ease;
}

.navbar-brand:hover {
  transform: scale(1.05);
}

.brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-text {
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}

.mobile-menu-toggle span {
  width: 100%;
  height: 2px;
  background: white;
  border-radius: 1px;
  transition: all 0.3s ease;
}

.mobile-menu-toggle.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.mobile-menu-toggle.active span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-toggle.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.navbar-nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateY(-1px);
}

.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.cart-link .cart-icon-wrapper {
  position: relative;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff4757;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.navbar-user {
  position: relative;
}

.auth-links {
  display: flex;
  gap: 1rem;
}

.login-link {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.register-link {
  background: white;
  color: #ee4d2d;
}

.register-link:hover {
  background: rgba(255, 255, 255, 0.95);
  color: #ee4d2d;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
}

.user-dropdown:hover {
  background: rgba(255, 255, 255, 0.15);
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dropdown-arrow {
  transition: transform 0.3s ease;
}

.user-dropdown.open .dropdown-arrow {
  transform: rotate(180deg);
}

.user-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  overflow: hidden;
}

.user-dropdown-menu.open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: #333;
  transition: background 0.2s ease;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 0.9rem;
}

.dropdown-item:hover {
  background: #f8f9fa;
}

.logout-btn {
  border-top: 1px solid #eee;
  color: #dc3545;
}

.logout-btn:hover {
  background: #fef2f2;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .mobile-menu-toggle {
    display: flex;
  }

  .navbar-menu {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #ee4d2d 0%, #ff6b35 100%);
    flex-direction: column;
    padding: 1rem;
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    gap: 1rem;
  }

  .navbar-menu.mobile-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .navbar-nav {
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
  }

  .nav-link {
    width: 100%;
    justify-content: flex-start;
    padding: 1rem;
    border-radius: 8px;
  }

  .navbar-user {
    width: 100%;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }

  .auth-links {
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
  }

  .user-dropdown {
    width: 100%;
    justify-content: flex-start;
  }

  .user-dropdown-menu {
    position: static;
    margin-top: 0.5rem;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2);
  }

  .user-dropdown-menu.open {
    transform: none;
  }
}

@media (max-width: 480px) {
  .navbar-container {
    padding: 0 0.75rem;
  }

  .brand-text {
    font-size: 1.25rem;
  }
}
</style>
