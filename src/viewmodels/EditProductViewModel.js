export default {
  methods: {
    // This method is now in EditProductView.vue for direct access to this.$route
    // async fetchProduct() { ... }

    // This method is now in EditProductView.vue for direct access to this.$route
    // async submitForm() { ... }

    // This method is now in EditProductView.vue for direct access to this.$route
    // async deleteProduct() { ... }

    // Helper to get product image URL
    getProductImg(img) {
      if (!img) return '';
      if (/^https?:\/\//.test(img)) return img;
      return `http://localhost:3000/uploads/${encodeURIComponent(img)}`;
    },
  }
};
