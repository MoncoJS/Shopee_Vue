import axios from "axios";

export default {
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
      // console.error("Load products error:", e.response?.data || e);
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
      if (product.amount < quantity) {
        alert(`สินค้าไม่เพียงพอ มีเหลือเพียง ${product.amount} ชิ้น`);
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
        await axios.post(
          "http://localhost:3000/orders/",
          payload,
          config
        );
        // console.log("Order response:", response.data);
        alert("เพิ่มสินค้าลงตะกร้าแล้ว");
      } catch (e) {
        this.errorMessage =
          "เกิดข้อผิดพลาดในการเพิ่มสินค้า: " +
          (e.response?.data?.message || e.message);
        // console.error("Order error:", e.response?.data || e);
      }
    },
  },
};
         