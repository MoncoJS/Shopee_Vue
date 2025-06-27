import axios from 'axios'
import { getProductInfo, getItemId } from '../utils/cartUtils'
import CouponService from '../services/CouponService'

export default {
  data() {
    return {
      cart: {
        customerName: '',
        items: []
      },
      loading: true,
      products: [],
      errorMessage: '',
      couponCode: '',
      appliedCoupon: null,
    }
  },
  computed: {
    totalPrice() {
      return this.mergedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    },
    discountAmount() {
      if (!this.appliedCoupon) return 0;

      const total = this.totalPrice;
      if (this.appliedCoupon.discountType === 'percentage') {
        return (total * this.appliedCoupon.discountValue) / 100;
      } else if (this.appliedCoupon.discountType === 'fixed') {
        return this.appliedCoupon.discountValue;
      }
      return 0;
    },
    finalPrice() {
      return Math.max(0, this.totalPrice - this.discountAmount);
    },
    mergedItems() {
      const map = {}
      for (const item of this.cart.items) {
        const key = this.getProductInfo(item.product).id + '_' + item.price
        if (!map[key]) {
          map[key] = { ...item }
        } else {
          map[key].quantity += item.quantity
        }
      }
      return Object.values(map)
    }
  },
  methods: {
    getProductInfo(product) {
      return getProductInfo(product, this.products)
    },
    getItemId(item) {
      return getItemId(item)
    },
    async fetchProducts() {
      const res = await axios.get('http://localhost:3000/products/')
      this.products = Array.isArray(res.data.data) ? res.data.data : []
    },
    async fetchCart() {
      const token = localStorage.getItem('token')
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      const res = await axios.get('http://localhost:3000/orders/', config)
      const orders = res.data.data
      if (Array.isArray(orders)) {
        this.cart = orders.length > 0 ? orders[orders.length - 1] : { customerName: '', items: [] }
      } else {
        this.cart = orders || { customerName: '', items: [] }
      }
    },
    async restoreProductStock(items) {
      try {
        const token = localStorage.getItem('token')
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        await axios.post('http://localhost:3000/orders/restore', { items }, config)
        await this.fetchProducts()
      } catch (error) {
        // console.error('Error restoring product stock:', error)
      }
    },
    async removeItem(item) {
      const key = this.getProductInfo(item.product).id + '_' + item.price
      const itemsToRemove = this.cart.items.filter(i => {
        const k = this.getProductInfo(i.product).id + '_' + i.price
        return k === key
      })
      const restoreItems = itemsToRemove.map(i => ({ product: this.getProductInfo(i.product).id, quantity: i.quantity }))
      if (restoreItems.length > 0) {
        await this.restoreProductStock(restoreItems)
      }
      this.cart.items = this.cart.items.filter(i => {
        const k = this.getProductInfo(i.product).id + '_' + i.price
        return k !== key
      })
      await this.updateCartInDatabase()
    },
    increaseQty(item) {
      const key = this.getProductInfo(item.product).id + '_' + item.price
      const idx = this.cart.items.findIndex(i => {
        const k = this.getProductInfo(i.product).id + '_' + i.price
        return k === key
      })
      if (idx !== -1) {
        if (this.cart.items[idx].quantity < 99) {
          this.cart.items[idx].quantity++
        }
      }
    },
    decreaseQty(item) {
      const key = this.getProductInfo(item.product).id + '_' + item.price
      const idx = this.cart.items.findIndex(i => {
        const k = this.getProductInfo(i.product).id + '_' + i.price
        return k === key
      })
      if (idx !== -1 && this.cart.items[idx].quantity > 1) {
        this.cart.items[idx].quantity--
      }
    },
    async clearCart() {
      const restoreItems = this.cart.items.map(i => ({ product: this.getProductInfo(i.product).id, quantity: i.quantity }))
      if (restoreItems.length > 0) {
        await this.restoreProductStock(restoreItems)
      }
      this.cart.items = []
      await this.updateCartInDatabase()
      this.appliedCoupon = null; // Clear coupon when cart is cleared
    },
    async applyCoupon() {
      if (!this.couponCode) {
        this.errorMessage = 'Please enter a coupon code.';
        this.appliedCoupon = null;
        return;
      }
      try {
        const response = await CouponService.getCouponByCode(this.couponCode);
        const coupon = response.data.data;

        if (!coupon || !coupon.isActive || new Date(coupon.expirationDate) < new Date()) {
          this.errorMessage = 'Invalid or expired coupon code.';
          this.appliedCoupon = null;
        } else {
          this.appliedCoupon = coupon;
          this.errorMessage = '';
          alert('Coupon applied successfully!');
        }
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Error applying coupon.';
        this.appliedCoupon = null;
      }
    },
    async updateCartInDatabase(coupon = null) {
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        const config = { headers: { Authorization: `Bearer ${token}` } }
        const data = {
          customerName: this.cart.customerName,
          items: this.cart.items,
        };
        if (coupon) {
          data.couponCode = coupon.code;
        }
        await axios.put('http://localhost:3000/orders/', data, config)
      } catch (error) {
        // console.error('Error updating cart in database:', error)
      }
    },
    async checkout() {
      alert('ขอบคุณสำหรับการสั่งซื้อ! (ฟังก์ชันนี้เป็นตัวอย่าง)')
      const restoreItems = this.cart.items.map(i => ({ product: this.getProductInfo(i.product).id, quantity: i.quantity }))
      if (restoreItems.length > 0) {
        await this.restoreProductStock(restoreItems)
      }
      this.cart.items = []
      await this.updateCartInDatabase(this.appliedCoupon);
      this.appliedCoupon = null; // Clear coupon after checkout
    }
  },
  async mounted() {
    this.loading = true
    try {
      await this.fetchProducts()
      await this.fetchCart()
    } catch (e) {
      this.cart = { customerName: '', items: [] }
      this.errorMessage = 'เกิดข้อผิดพลาดในการโหลดตะกร้า: ' + (e.response?.data?.message || e.message)
      // console.error('Cart load error:', e.response?.data || e)
    } finally {
      this.loading = false
    }
  }
}
