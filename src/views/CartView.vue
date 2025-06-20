<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
    <div class="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">
      <h2 class="text-3xl font-bold mb-6 text-center text-primary">🛒 ตะกร้าสินค้า</h2>
      <div v-if="loading" class="text-lg text-center">Loading...</div>
      <div v-if="errorMessage" class="text-red-500 mb-4 text-center">{{ errorMessage }}</div>
      <div v-else>
        <div class="overflow-x-auto">
          <table class="table w-full mb-4 rounded-xl overflow-hidden">
            <thead class="bg-gradient-to-r from-green-100 to-blue-100">
              <tr>
                <th class="text-base font-semibold">ชื่อสินค้า</th>
                <th class="text-base font-semibold">จำนวน</th>
                <th class="text-base font-semibold">ราคา/ชิ้น</th>
                <th class="text-base font-semibold">รวม</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in mergedItems" :key="getItemId(item)" class="hover:bg-green-50 transition-colors">
                <td class="py-2">{{ getProductInfo(item.product).name }}</td>
                <td class="py-2">{{ item.quantity }}</td>
                <td class="py-2">{{ item.price }}</td>
                <td class="py-2">{{ item.price * item.quantity }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="text-right font-bold text-xl mt-4">
          รวมทั้งหมด: <span class="text-green-600">{{ totalPrice }}</span> บาท
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'CartView',
  data() {
    return {
      cart: {
        customerName: '',
        items: []
      },
      loading: true,
      products: [],
      errorMessage: ''
    }
  },
  computed: {
    totalPrice() {
      return this.mergedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    },
    mergedItems() {
      // ใช้ getProductInfo เพื่อรวมสินค้าซ้ำ
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
      // คืนค่า { id, name } ของสินค้า
      let id = ''
      if (typeof product === 'string') id = product
      else if (product && product.$oid) id = product.$oid
      else if (product && product._id) id = product._id
      // ถ้า populate แล้ว
      if (product && product.product_name) {
        return { id: product._id ? product._id : id, name: product.product_name }
      }
      // หาใน products
      const found = this.products.find(p => p._id === id)
      return { id, name: found ? found.product_name : id }
    },
    getItemId(item) {
      if (typeof item._id === 'string') return item._id
      if (item._id && item._id.$oid) return item._id.$oid
      return Math.random()
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
      console.error('Cart load error:', e.response?.data || e)
    } finally {
      this.loading = false
    }
  }
}
</script>

<style scoped>
.table th, .table td {
  text-align: center;
  vertical-align: middle;
}
.table {
  border-radius: 1rem;
  overflow: hidden;
}
@media (max-width: 600px) {
  .w-full.max-w-2xl {
    padding: 1rem;
  }
  .table th, .table td {
    font-size: 0.95rem;
    padding: 0.3rem;
  }
}
</style>