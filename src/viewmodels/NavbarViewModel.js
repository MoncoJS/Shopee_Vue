import axios from 'axios'
import { getProductName, itemKey, getProductInfo } from '../utils/cartUtils'

export default {
    data() {
        return {
            cart: { customerName: '', items: [] },
            products: []
        }
    },
    computed: {
        customerName() {
            const token = localStorage.getItem('token')
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]))
                    return payload.firstName || payload.username || ''
                } catch (e) {
                    return ''
                }
            }
            return ''
        },
        cartItems() {
            return this.cart.items || []
        },
        cartCount() {
            return this.cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
        },
        cartTotal() {
            return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        }
    },
    methods: {
        async fetchCart() {
            const token = localStorage.getItem('token')
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
            try {
                const res = await axios.get('http://localhost:3000/orders/', config)
                const orders = res.data.data
                if (Array.isArray(orders)) {
                    this.cart = orders.length > 0 ? orders[orders.length - 1] : { customerName: '', items: [] }
                } else {
                    this.cart = orders || { customerName: '', items: [] }
                }
            } catch (e) {
                this.cart = { customerName: '', items: [] }
            }
        },
        async fetchProducts() {
            try {
                const res = await axios.get('http://localhost:3000/products/')
                this.products = Array.isArray(res.data.data) ? res.data.data : []
            } catch (e) {
                this.products = []
            }
        },
        getProductName(item) {
            return getProductName(item, this.products)
        },
        getProductInfo(product) {
            return getProductInfo(product, this.products)
        },
        getProductImg(img) {
            if (!img) return '';
            if (/^https?:\/\//.test(img)) return img;
            return `http://localhost:3000/uploads/${encodeURIComponent(img)}`;
        },
        itemKey(item) {
            return itemKey(item)
        }
    },
    mounted() {
        // window.addEventListener('storage', this.syncLoginState) // No longer needed
        this.fetchCart()
        this.fetchProducts()
    },
}