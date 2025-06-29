import api from '../services/api.js'

export default {
  data() {
    return {
      products: [],
      loading: false,
      error: null,
      errorMessage: ''
    }
  },
  async created() {
    await this.fetchProducts()
  },
  methods: {
    async fetchProducts() {
      this.loading = true
      this.error = null
      this.errorMessage = ''
      
      try {
        const response = await api.get('/products/')
        if (response.data && response.data.success) {
          this.products = response.data.data || []
        } else {
          this.products = []
          this.error = 'ไม่สามารถโหลดข้อมูลสินค้าได้'
          this.errorMessage = 'ไม่สามารถโหลดข้อมูลสินค้าได้'
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        this.products = []
        this.error = 'เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า'
        this.errorMessage = 'เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า'
      } finally {
        this.loading = false
      }
    },
    
    async addToCart(product, quantity = 1) {
      if (!product || !product._id) {
        throw new Error('ข้อมูลสินค้าไม่ถูกต้อง')
      }

      try {
        const response = await api.post('/orders/', {
          items: [{
            product: product._id,
            quantity: quantity,
            price: product.price || product.Product_price || 0
          }]
        })
        
        if (response.data.success) {
          // Update navbar cart count
          this.$store.dispatch('fetchUser')
          return response.data
        } else {
          throw new Error(response.data.message || 'ไม่สามารถเพิ่มสินค้าลงตะกร้าได้')
        }
      } catch (error) {
        console.error('Error adding to cart:', error)
        throw new Error(error.response?.data?.message || error.message || 'เกิดข้อผิดพลาดในการเพิ่มสินค้าลงตะกร้า')
      }
    },

    getProductImageUrl(imgPath) {
      if (!imgPath) return '';
      
      // If it's already a full URL, return as is
      if (/^https?:\/\//.test(imgPath)) return imgPath;
      
      const baseUrl = process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000';
      
      // Clean the imgPath - remove any leading slashes or 'uploads/' prefix
      let cleanPath = imgPath.replace(/^\/+/, '').replace(/^uploads\//, '');
      
      // Return the full URL
      return `${baseUrl}/uploads/${cleanPath}`;
    },

    async fetchImageAsBlob(imgPath) {
      try {
        const response = await api.get(`/products/image/${encodeURIComponent(imgPath)}`, {
          responseType: 'blob'
        });
        return URL.createObjectURL(response.data);
      } catch (error) {
        console.error('Error fetching image:', error);
        return null;
      }
    }
  }
}
