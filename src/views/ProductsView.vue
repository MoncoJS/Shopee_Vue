<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 flex flex-col">
    <header class="w-full py-8 bg-white shadow-md mb-8">
      <h1 class="text-4xl font-extrabold text-center text-green-700 tracking-tight drop-shadow">
        สินค้าทั้งหมด
      </h1>
    </header>
    <div class="flex-1 container mx-auto px-4">
      <div v-if="loading" class="text-xl text-center mt-20 font-semibold text-blue-700 animate-pulse">Loading...</div>
      <div v-if="errorMessage" class="text-red-500 mb-6 text-center text-lg font-medium">
        {{ errorMessage }}
      </div>
      <div v-else class="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <div v-for="product in products" :key="product._id"
          class="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-200 border border-gray-200 flex flex-col overflow-hidden group">
          <div class="bg-gradient-to-tr from-green-100 to-blue-100 h-32 flex items-center justify-center">
            <span class="text-5xl text-green-400 group-hover:scale-110 transition-transform">🛍️</span>
          </div>
          <div class="flex-1 flex flex-col p-6">
            <h2 class="text-xl font-bold mb-2 text-green-700 group-hover:text-blue-700 transition-colors">
              {{ product.product_name }}
            </h2>
            <p v-if="product.description" class="mb-2 text-gray-500 text-sm">
              {{ product.description }}
            </p>
            <div class="flex flex-col gap-1 mb-2">
              <span class="text-gray-700">ราคา: <span class="font-bold text-green-600 text-lg">{{ product.price }}</span> บาท</span>
              <span class="text-gray-700">จำนวนคงเหลือ: <span class="font-semibold">{{ product.amount }}</span></span>
            </div>
            <div class="flex items-center gap-2 mb-4">
              <label class="text-gray-600 text-sm text-nowrap">จำนวนสั่ง:</label>
              <input type="number" min="1" :max="product.amount" v-model.number="quantities[product._id]"
                class="input input-bordered w-20 text-center" />
            </div>
            <button
              class="mt-auto btn w-full rounded-xl bg-gradient-to-r from-green-400 to-blue-400 text-white font-semibold text-lg shadow-lg hover:from-blue-400 hover:to-green-400 transition-all"
              @click="addToCart(product)">
              เพิ่มลงตะกร้า
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ProductsView",
  data() {
    return {
      products: [],
      loading: true,
      quantities: {},
      errorMessage: "",
    };
  },
  async mounted() {
    try {
      const res = await axios.get("http://localhost:3000/products/");
      this.products = Array.isArray(res.data.data) ? res.data.data : [];
      this.products.forEach((p) => {
        this.$set(this.quantities, p._id, 1);
      });
    } catch (e) {
      this.products = [];
      this.errorMessage =
        "เกิดข้อผิดพลาดในการโหลดสินค้า: " +
        (e.response?.data?.message || e.message);
      console.error("Load products error:", e.response?.data || e);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async addToCart(product) {
      const quantity = this.quantities[product._id] || 1;
      if (quantity < 1) {
        alert("กรุณาระบุจำนวนสั่งซื้อให้ถูกต้อง");
        return;
      }
      try {
        const token = localStorage.getItem("token");
        let customerName = "";
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          customerName = payload.firstName || payload.username || "";
        } catch (e) {
          customerName = "";
        }
        const payload = {
          customerName: customerName,
          items: [
            {
              product: product._id,
              quantity: quantity,
              price: product.price,
            },
          ],
        };
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};
        const response = await axios.post(
          "http://localhost:3000/orders/",
          payload,
          config
        );
        console.log("Order response:", response.data);
        alert("เพิ่มสินค้าลงตะกร้าแล้ว");
      } catch (e) {
        this.errorMessage =
          "เกิดข้อผิดพลาดในการเพิ่มสินค้า: " +
          (e.response?.data?.message || e.message);
        console.error("Order error:", e.response?.data || e);
      }
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 1200px;
}
.btn {
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  border: none;
  outline: none;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
}
.input-bordered {
  border-radius: 0.75rem;
  border: 1px solid #d1d5db;
  padding: 0.4rem 0.7rem;
}
</style>