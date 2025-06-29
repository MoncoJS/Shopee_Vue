import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['getUser', 'isLoggedIn', 'isAdmin']),
    
    user() {
      return this.getUser
    },
    
    cartItemCount() {
      if (!this.user || !this.user.cart) return 0
      return this.user.cart.reduce((total, item) => total + (item.quantity || 0), 0)
    },
    
    userName() {
      if (!this.user) return 'ผู้ใช้'
      return this.user.firstName 
        ? `${this.user.firstName} ${this.user.lastName || ''}`.trim()
        : this.user.username || this.user.email || 'ผู้ใช้'
    }
  },
  
  methods: {
    async logout() {
      try {
        await this.$store.dispatch('logout')
        this.$router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
        // Force logout even if API call fails
        this.$store.dispatch('clearUser')
        this.$router.push('/login')
      }
    }
  }
}
