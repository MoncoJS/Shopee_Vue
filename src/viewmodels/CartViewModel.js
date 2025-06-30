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
        // Check if item and item.product exist before accessing properties
        if (!item || !item.product) {
          console.warn('Skipping invalid item:', item)
          return
        }
        
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
      
      // Clean up cart after fetching
      await this.cleanupCart()
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
      // Add null check for item
      if (!item) {
        return { 
          _id: null,
          name: 'Unknown Product', 
          img: null,
          price: 0
        }
      }
      
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
      if (!item || !item.product) {
        return 'unknown_0'
      }
      const productId = item.product._id || item.product
      return `${productId}_${item.price}`
    },
    async increaseQty(item) {
      if (!item || !item.product) {
        console.warn('Cannot increase quantity: invalid item', item)
        return
      }
      
      try {
        // Update the local quantity first
        const updatedOrders = this.orders.map(order => {
          if (order.product && (order.product._id || order.product) === item.product) {
            return { ...order, quantity: order.quantity + 1 }
          }
          return order
        })
        
        // Update the entire cart
        await api.put('/orders/', {
          items: updatedOrders
            .filter(order => order && order.product) // Ensure order and product exist
            .map(order => ({
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
      if (!item || !item.product || item.quantity <= 1) {
        console.warn('Cannot decrease quantity: invalid item or quantity <= 1', item)
        return
      }
      
      try {
        // Update the local quantity first
        const updatedOrders = this.orders.map(order => {
          if (order.product && (order.product._id || order.product) === item.product) {
            return { ...order, quantity: Math.max(1, order.quantity - 1) }
          }
          return order
        })
        
        // Update the entire cart
        await api.put('/orders/', {
          items: updatedOrders
            .filter(order => order && order.product) // Ensure order and product exist
            .map(order => ({
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
      if (!item || !item.product) {
        console.warn('Cannot remove item: invalid item', item)
        return
      }
      
      try {
        console.log('Removing item:', item) // Debug log
        
        // Get the product ID to compare
        const productId = item.product._id || item.product
        console.log('Product ID to remove:', productId) // Debug log
        console.log('Current orders:', this.orders) // Debug log
        
        // Remove items for this product from the cart
        const remainingOrders = this.orders.filter(order => {
          if (!order.product) return false
          const orderProductId = order.product._id || order.product
          console.log('Comparing:', orderProductId, 'with:', productId) // Debug log
          return orderProductId !== productId
        })
        
        console.log('Remaining orders after filter:', remainingOrders) // Debug log
        
        // Get items to restore stock for
        const itemsToRestore = this.orders.filter(order => {
          if (!order.product) return false
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
          items: remainingOrders
            .filter(order => order && order.product) // Ensure order and product exist
            .map(order => ({
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
        const itemsToRestore = this.orders
          .filter(order => order && order.product) // Filter out invalid orders
          .map(order => ({
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
        // Check if we have items to checkout
        if (!this.mergedItems || this.mergedItems.length === 0) {
          throw new Error('ไม่มีสินค้าในตะกร้า')
        }
        
        // Check stock availability before checkout
        console.log('Checking stock availability...')
        const { outOfStockItems, lowStockItems } = await this.checkStockAvailability()
        
        if (outOfStockItems.length > 0 || lowStockItems.length > 0) {
          // Create detailed error message
          let errorMessage = 'พบปัญหาเกี่ยวกับสินค้าในตะกร้า:\n\n'
          
          if (outOfStockItems.length > 0) {
            errorMessage += '🔴 สินค้าที่หมดแล้ว:\n'
            outOfStockItems.forEach(item => {
              errorMessage += `• ${item.productName} (ต้องการ ${item.quantity} ชิ้น)\n`
            })
            errorMessage += '\n'
          }
          
          if (lowStockItems.length > 0) {
            errorMessage += '⚠️ สินค้าที่เหลือไม่เพียงพอ:\n'
            lowStockItems.forEach(item => {
              errorMessage += `• ${item.productName}: ต้องการ ${item.requestedQuantity} ชิ้น แต่เหลือเพียง ${item.currentStock} ชิ้น\n`
            })
          }
          
          errorMessage += '\nกรุณาแก้ไขจำนวนสินค้าหรือลบสินค้าที่หมดออกจากตะกร้า'
          throw new Error(errorMessage)
        }
        
        // Filter out items with null products and prepare data
        const validItems = this.mergedItems.filter(item => {
          if (!item.product) {
            console.warn('Skipping item with null product:', item)
            return false
          }
          return true
        })
        
        if (validItems.length === 0) {
          throw new Error('ไม่มีสินค้าที่ถูกต้องในตะกร้า')
        }
        
        // Prepare data in the format expected by the backend
        const selectedItems = validItems.map(item => {
          const productId = item.product?._id || item.product
          if (!productId) {
            throw new Error(`ไม่พบข้อมูลสินค้า: ${JSON.stringify(item)}`)
          }
          
          return {
            _id: item._id,
            product: productId,
            quantity: item.quantity || 1,
            price: item.price || 0
          }
        })
        
        const orderData = {
          selectedItems: selectedItems,
          couponCode: this.appliedCoupon?.code || null
        }
        
        console.log('Sending checkout data:', orderData) // Debug log
        
        const response = await api.post('/orders/checkout', orderData)
        
        if (!response.data.success) {
          // Handle detailed error messages
          if (response.data.errors && Array.isArray(response.data.errors)) {
            throw new Error(`มีปัญหากับสินค้า:\n${response.data.errors.join('\n')}`)
          }
          throw new Error(response.data.message || 'เกิดข้อผิดพลาดในการสั่งซื้อ')
        }
        
        // Generate bill data
        const billData = this.generateBillData(response.data)
        
        // Clear cart after successful checkout
        await this.clearCart()
        
        return { success: true, billData }
      } catch (error) {
        console.error('Error during checkout:', error)
        console.error('Response data:', error.response?.data) // Debug log
        
        // Create more user-friendly error messages
        let errorMessage = 'เกิดข้อผิดพลาดในการสั่งซื้อ'
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
          
          // Handle specific error cases
          if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
            errorMessage = `${error.response.data.message}:\n${error.response.data.errors.join('\n')}`
          }
        } else if (error.message) {
          errorMessage = error.message
        }
        
        // Clean up stock shortage messages
        if (errorMessage.includes('Insufficient stock')) {
          errorMessage = errorMessage.replace(/Insufficient stock for product /g, 'สินค้า ')
            .replace(/Available: /g, 'เหลือ ')
            .replace(/Requested: /g, 'ต้องการ ')
            .replace(/\./g, ' ชิ้น')
        }
        
        throw new Error(errorMessage)
      }
    },
    
    generateBillData(orderResponse) {
      console.log('Generating bill from response:', orderResponse) // Debug log
      
      // Extract order data from response
      const orderData = orderResponse.data || orderResponse
      
      // Generate a unique order number
      const orderNumber = orderData._id || `ORD-${Date.now()}`
      
      // Get current user info
      const currentUser = this.getCurrentUser()
      
      // Prepare items with full product info
      const billItems = this.mergedItems.map(item => {
        const productInfo = this.getProductInfo(item)
        return {
          _id: item._id,
          product: item.product,
          productName: productInfo.name,
          productImage: productInfo.img,
          quantity: item.quantity,
          price: item.price
        }
      })
      
      return {
        orderNumber,
        orderDate: orderData.orderDate || new Date().toISOString(),
        customerName: currentUser?.name || currentUser?.username || currentUser?.email || 'ลูกค้า',
        items: billItems,
        subtotal: this.totalPrice,
        discount: this.discountAmount,
        total: this.finalPrice,
        couponCode: this.appliedCoupon?.code || null,
        storeName: 'Shopee Clone Store'
      }
    },
    
    // Helper method to safely access user information
    getCurrentUser() {
      return this.$store.state.user || this.$store.getters.user || null
    },
    
    // Helper method to clean up invalid cart items
    async cleanupCart() {
      try {
        const validItems = this.orders.filter(order => order && order.product)
        
        if (validItems.length < this.orders.length) {
          console.log(`Cleaning up cart: removing ${this.orders.length - validItems.length} invalid items`)
          
          // Update cart with only valid items
          await api.put('/orders/', {
            items: validItems.map(order => ({
              product: order.product._id || order.product,
              quantity: order.quantity,
              price: order.price
            }))
          })
          
          // Refresh cart data
          await this.fetchCartItems()
        }
      } catch (error) {
        console.error('Error cleaning up cart:', error)
      }
    },
    
    // Check stock availability for cart items
    async checkStockAvailability() {
      const outOfStockItems = []
      const lowStockItems = []
      
      for (const item of this.mergedItems) {
        try {
          const productInfo = this.getProductInfo(item)
          const productId = item.product?._id || item.product
          
          if (!productId) continue
          
          // Fetch current product data to check stock
          const response = await api.get(`/products/${productId}`)
          if (response.data && response.data.success) {
            const product = response.data.data
            const currentStock = product.amount !== undefined ? product.amount : product.stock || 0
            
            if (currentStock === 0) {
              outOfStockItems.push({
                ...item,
                productName: productInfo.name,
                currentStock: 0
              })
            } else if (currentStock < item.quantity) {
              lowStockItems.push({
                ...item,
                productName: productInfo.name,
                currentStock,
                requestedQuantity: item.quantity
              })
            }
          }
        } catch (error) {
          console.error('Error checking stock for item:', item, error)
        }
      }
      
      return { outOfStockItems, lowStockItems }
    },
    
    // Remove out of stock items from cart
    async removeOutOfStockItems(outOfStockItems) {
      try {
        for (const item of outOfStockItems) {
          await this.removeItem(item)
        }
        await this.fetchCartItems()
        return true
      } catch (error) {
        console.error('Error removing out of stock items:', error)
        return false
      }
    },
    
    // Update quantities for low stock items
    async updateLowStockQuantities(lowStockItems) {
      try {
        // Create updated orders with corrected quantities
        const updatedOrders = this.orders.map(order => {
          const lowStockItem = lowStockItems.find(item => 
            (order.product?._id || order.product) === (item.product?._id || item.product)
          )
          
          if (lowStockItem) {
            return { ...order, quantity: lowStockItem.currentStock }
          }
          return order
        })
        
        // Update the entire cart
        await api.put('/orders/', {
          items: updatedOrders
            .filter(order => order && order.product && order.quantity > 0)
            .map(order => ({
              product: order.product._id || order.product,
              quantity: order.quantity,
              price: order.price
            }))
        })
        
        await this.fetchCartItems()
        return true
      } catch (error) {
        console.error('Error updating low stock quantities:', error)
        return false
      }
    },
  }
}
