import api from '@/services/api'
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      orders: [],
      products: {},
      loading: false,
      errorMessage: '',
      couponCode: '',
      appliedCoupon: null
    }
  },
  computed: {
    ...mapGetters(['isLoggedIn']),
    mergedItems() {
      const itemMap = new Map()
      
      // Ensure orders is an array before calling forEach
      if (!Array.isArray(this.orders)) {
        return []
      }
      
      this.orders.forEach(item => {
        // item.product could be an object or just an ID
        const productId = item.product._id || item.product
        const key = `${productId}_${item.price}`
        const existingItem = itemMap.get(key)
        
        if (existingItem) {
          existingItem.quantity += item.quantity
        } else {
          itemMap.set(key, {
            product: item.product,
            quantity: item.quantity,
            price: item.price,
            _id: item._id,
            orderId: item.orderId
          })
        }
      })
      
      return Array.from(itemMap.values())
    },
    totalPrice() {
      return this.mergedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    },
    discountAmount() {
      if (!this.appliedCoupon) return 0
      return (this.totalPrice * this.appliedCoupon.discount) / 100
    },
    finalPrice() {
      return this.totalPrice - this.discountAmount
    }
  },
  async mounted() {
    console.log('CartViewModel mounted, isLoggedIn:', this.isLoggedIn) // Debug log
    
    // Try to fetch user first to ensure authentication is initialized
    try {
      await this.$store.dispatch('fetchUser')
      console.log('After fetchUser, isLoggedIn:', this.isLoggedIn) // Debug log
    } catch (error) {
      console.error('Error fetching user:', error)
    }
    
    // Now check if logged in and fetch cart data
    if (this.isLoggedIn) {
      await this.fetchCartItems()
      await this.fetchProducts()
    }
  },
  watch: {
    // Watch for login state changes
    isLoggedIn(newVal) {
      console.log('Login state changed:', newVal) // Debug log
      if (newVal) {
        this.fetchCartItems()
        this.fetchProducts()
      } else {
        this.orders = []
        this.products = {}
      }
    }
  },
  methods: {
    async fetchCartItems() {
      this.loading = true
      this.errorMessage = ''
      try {
        const response = await api.get('/orders/')
        
        console.log('Cart response:', response.data) // Debug log
        
        // Extract items from all pending orders
        if (response.data && response.data.success && response.data.data) {
          let allItems = []
          response.data.data.forEach(order => {
            console.log('Processing order:', order) // Debug log
            if (order.items && Array.isArray(order.items)) {
              // Add order ID to each item for tracking
              order.items.forEach(item => {
                console.log('Processing item:', item) // Debug log
                allItems.push({
                  ...item,
                  orderId: order._id
                })
              })
            }
          })
          this.orders = allItems
          console.log('Final orders:', this.orders) // Debug log
        } else {
          this.orders = []
        }
      } catch (error) {
        console.error('Error fetching cart items:', error)
        this.errorMessage = 'ไม่สามารถโหลดตะกร้าสินค้าได้'
        this.orders = []
      } finally {
        this.loading = false
      }
    },
    async fetchProducts() {
      try {
        const response = await api.get('/products/')
        const productsMap = {}
        if (response.data && response.data.success && response.data.data) {
          response.data.data.forEach(product => {
            productsMap[product._id] = product
          })
        }
        this.products = productsMap
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    },
    getProductInfo(item) {
      // If item.product is already populated (object), use it directly
      if (item.product && typeof item.product === 'object' && item.product._id) {
        return {
          _id: item.product._id,
          name: item.product.product_name || item.product.name || 'Unknown Product',
          img: item.product.img || item.product.Product_img || null,
          price: item.product.price || item.product.Product_price || item.price
        }
      }
      
      // If item.product is just an ID, try to get from products map
      const productId = typeof item.product === 'string' ? item.product : item.product
      const product = this.products[productId]
      
      if (product) {
        return {
          _id: product._id,
          name: product.product_name || product.name || 'Unknown Product',
          img: product.img || product.Product_img || null,
          price: product.price || product.Product_price || item.price
        }
      }
      
      return { 
        _id: productId,
        name: 'Unknown Product', 
        img: null,
        price: item.price || 0
      }
    },
    getItemId(item) {
      const productId = item.product._id || item.product
      return `${productId}_${item.price}`
    },
    async increaseQty(item) {
      try {
        // Update the local quantity first
        const updatedOrders = this.orders.map(order => {
          if ((order.product._id || order.product) === item.product) {
            return { ...order, quantity: order.quantity + 1 }
          }
          return order
        })
        
        // Update the entire cart
        await api.put('/orders/', {
          items: updatedOrders.map(order => ({
            product: order.product._id || order.product,
            quantity: order.quantity,
            price: order.price
          }))
        })
        
        await this.fetchCartItems()
      } catch (error) {
        console.error('Error updating quantity:', error)
      }
    },
    async decreaseQty(item) {
      if (item.quantity <= 1) return
      
      try {
        // Update the local quantity first
        const updatedOrders = this.orders.map(order => {
          if ((order.product._id || order.product) === item.product) {
            return { ...order, quantity: Math.max(1, order.quantity - 1) }
          }
          return order
        })
        
        // Update the entire cart
        await api.put('/orders/', {
          items: updatedOrders.map(order => ({
            product: order.product._id || order.product,
            quantity: order.quantity,
            price: order.price
          }))
        })
        
        await this.fetchCartItems()
      } catch (error) {
        console.error('Error updating quantity:', error)
      }
    },
    async removeItem(item) {
      try {
        console.log('Removing item:', item) // Debug log
        
        // Get the product ID to compare
        const productId = item.product._id || item.product
        console.log('Product ID to remove:', productId) // Debug log
        console.log('Current orders:', this.orders) // Debug log
        
        // Remove items for this product from the cart
        const remainingOrders = this.orders.filter(order => {
          const orderProductId = order.product._id || order.product
          console.log('Comparing:', orderProductId, 'with:', productId) // Debug log
          return orderProductId !== productId
        })
        
        console.log('Remaining orders after filter:', remainingOrders) // Debug log
        
        // Get items to restore stock for
        const itemsToRestore = this.orders.filter(order => {
          const orderProductId = order.product._id || order.product
          return orderProductId === productId
        }).map(order => ({
          product: order.product._id || order.product,
          quantity: order.quantity
        }))
        
        console.log('Items to restore:', itemsToRestore) // Debug log
        
        // Restore stock for removed items
        if (itemsToRestore.length > 0) {
          console.log('Restoring stock...')
          await api.post('/orders/restore', {
            items: itemsToRestore
          })
        }
        
        // Update the cart with remaining items
        console.log('Updating cart with remaining items...')
        await api.put('/orders/', {
          items: remainingOrders.map(order => ({
            product: order.product._id || order.product,
            quantity: order.quantity,
            price: order.price
          }))
        })
        
        console.log('Fetching updated cart...')
        await this.fetchCartItems()
      } catch (error) {
        console.error('Error removing item:', error)
        throw error
      }
    },
    async clearCart() {
      try {
        // Restore stock for all items
        const itemsToRestore = this.orders.map(order => ({
          product: order.product._id || order.product,
          quantity: order.quantity
        }))
        
        if (itemsToRestore.length > 0) {
          await api.post('/orders/restore', {
            items: itemsToRestore
          })
        }
        
        // Clear the cart by updating with empty items array
        await api.put('/orders/', {
          items: []
        })
        
        await this.fetchCartItems()
      } catch (error) {
        console.error('Error clearing cart:', error)
        throw error
      }
    },
    async applyCoupon() {
      if (!this.couponCode.trim()) return
      
      try {
        const response = await api.get(`/coupons/${this.couponCode}`)
        this.appliedCoupon = response.data
      } catch (error) {
        console.error('Error applying coupon:', error)
        alert('โค้ดส่วนลดไม่ถูกต้อง')
      }
    },
    async checkout() {
      try {
        const orderData = {
          items: this.mergedItems,
          totalPrice: this.finalPrice,
          appliedCoupon: this.appliedCoupon
        }
        
        await api.post('/orders/checkout', orderData)
        
        // Clear cart after successful checkout
        await this.clearCart()
        
        return true
      } catch (error) {
        console.error('Error during checkout:', error)
        throw error
      }
    }
  }
}
