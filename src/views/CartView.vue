<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 flex flex-col">
    <header class="w-full py-8 bg-white shadow-md mb-8">
      <h2 class="text-4xl font-extrabold text-center text-green-700 tracking-tight drop-shadow">
        🛒 ตะกร้าสินค้า
      </h2>
    </header>
    <div class="flex-1 container mx-auto px-4 flex flex-col items-center">
      <div class="w-full max-w-3xl bg-white p-10 rounded-3xl shadow-2xl border border-gray-100">
        <div v-if="loading" class="text-xl text-center font-semibold text-blue-700 animate-pulse">Loading...</div>
        <div v-if="errorMessage" class="text-red-500 mb-6 text-center text-lg font-medium">{{ errorMessage }}</div>
        <div v-else>
          <div class="overflow-x-auto">
            <table class="table w-full mb-6 rounded-xl overflow-hidden shadow">
              <thead class="bg-gradient-to-r from-green-100 to-blue-100">
                <tr>
                  <th class="text-base font-semibold py-3">ชื่อสินค้า</th>
                  <th class="text-base font-semibold py-3">จำนวน</th>
                  <th class="text-base font-semibold py-3">ราคา/ชิ้น</th>
                  <th class="text-base font-semibold py-3">รวม</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in mergedItems" :key="getItemId(item)" class="hover:bg-green-50 transition-colors">
                  <td class="py-3">{{ getProductInfo(item.product).name }}</td>
                  <td class="py-3">{{ item.quantity }}</td>
                  <td class="py-3">{{ item.price }}</td>
                  <td class="py-3">{{ item.price * item.quantity }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="text-right font-bold text-2xl mt-4">
            รวมทั้งหมด: <span class="text-green-600">{{ totalPrice }}</span> บาท
          </div>
          <div class="mt-8 flex justify-end">
            <router-link to="/products"
              class="btn bg-gradient-to-r from-blue-400 to-green-400 text-white rounded-xl px-6 py-2 font-semibold shadow hover:from-green-400 hover:to-blue-400 transition-all">
              กลับไปเลือกสินค้า
            </router-link>
          </div>
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
.container {
  max-width: 1200px;
}
.btn {
  border: none;
  outline: none;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
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