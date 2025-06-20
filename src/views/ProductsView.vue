<template>
  <div class="flex flex-col min-h-screen bg-base-200 p-6">
    <div v-if="loading" class="text-lg text-center mt-10">Loading...</div>
    <div v-if="errorMessage" class="text-red-500 mb-4 text-center">{{ errorMessage }}</div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
      <div v-for="product in products" :key="product._id"
        class="card w-full max-w-xs bg-white shadow-xl hover:shadow-2xl transition-shadow duration-200 mx-auto">
        <div class="card-body flex flex-col">
          <h2 class="card-title text-xl mb-2 text-primary">{{ product.product_name }}</h2>
          <p v-if="product.description" class="mb-2 text-gray-600">รายละเอียด: {{ product.description }}</p>
          <p class="mb-2">ราคา: <span class="font-bold text-green-600">{{ product.price }}</span> บาท</p>
          <p class="mb-2">จำนวน: <span class="font-semibold">{{ product.amount }}</span></p>
          <div class="mb-2 flex items-center">
            <label class="mr-2">จำนวนสั่งซื้อ:</label>
            <input type="number" min="1" :max="product.amount" v-model.number="quantities[product._id]"
              class="input input-bordered w-20" />
          </div>
          <button class="btn btn-success mt-2 w-full" @click="addToCart(product)">
            เพิ่มลงตะกร้า
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ProductsView',
  data() {
    return {
      products: [],
      loading: true,
      quantities: {},
      errorMessage: ''
    }
  },
  async mounted() {
    try {
      const res = await axios.get('http://localhost:3000/products/');
      this.products = Array.isArray(res.data.data) ? res.data.data : [];
      this.products.forEach(p => {
        this.$set(this.quantities, p._id, 1);
      });
    } catch (e) {
      this.products = [];
      this.errorMessage = 'เกิดข้อผิดพลาดในการโหลดสินค้า: ' + (e.response?.data?.message || e.message);
      console.error('Load products error:', e.response?.data || e);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async addToCart(product) {
      const quantity = this.quantities[product._id] || 1;
      if (quantity < 1) {
        alert('กรุณาระบุจำนวนสั่งซื้อให้ถูกต้อง');
        return;
      }
      try {
        const token = localStorage.getItem('token');
        let customerName = '';
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          customerName = payload.firstName || payload.username || '';
        } catch (e) {
          customerName = '';
        }
        const payload = {
          customerName: customerName,
          items: [
            {
              product: product._id,
              quantity: quantity,
              price: product.price
            }
          ]
        };
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await axios.post('http://localhost:3000/orders/', payload, config);
        console.log('Order response:', response.data);
        alert('เพิ่มสินค้าลงตะกร้าแล้ว');
      } catch (e) {
        this.errorMessage = 'เกิดข้อผิดพลาดในการเพิ่มสินค้า: ' + (e.response?.data?.message || e.message);
        console.error('Order error:', e.response?.data || e);
      }
    }
  }
}
</script>

<style scoped>
.card {
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  transition: box-shadow 0.2s;
}

.card:hover {
  box-shadow: 0 8px 32px 0 rgba(60, 60, 60, 0.15);
}
</style>