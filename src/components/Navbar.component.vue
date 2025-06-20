<template>
    <nav class="navbar bg-base-100 shadow-sm px-6 py-2 flex items-center justify-between">
        <div class="flex items-center space-x-4">
            <a class="btn btn-ghost text-2xl font-bold tracking-wide flex items-center space-x-2">
                <span>🛒</span>
                <span>Shopee</span>
            </a>
            <router-link to="/products" class="btn btn-ghost text-base font-medium">Product</router-link>
            <router-link to="/cart" class="btn btn-ghost text-base font-medium">Cart</router-link>
        </div>
        <div class="flex items-center space-x-4">
            <div class="dropdown dropdown-end">
                <label tabindex="0" class="btn btn-ghost flex items-center gap-2 cursor-pointer">
                    <span class="font-bold">👤</span>
                    <span>{{ customerName || 'Guest' }}</span>
                    <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </label>
                <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40 mt-2">
                    <li v-if="!isLoggedIn">
                        <router-link to="/login" class="w-full">Login</router-link>
                    </li>
                    <li v-else>
                        <button @click="logout" class="w-full text-left">Log out</button>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script>
export default {
    name: 'AppNavbar',
    props: {
        msg: String
    },
    data() {
        return {
            isLoggedIn: !!localStorage.getItem('token'),
            cart: { customerName: '' }
        }
    },
    computed: {
        customerName() {
            // ดึงชื่อจาก token ทุกครั้งที่ render
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
        }
    },
    mounted() {
        window.addEventListener('storage', this.syncLoginState)
    },
    beforeDestroy() {
        window.removeEventListener('storage', this.syncLoginState)
    },
    methods: {
        logout() {
            localStorage.removeItem('token')
            this.isLoggedIn = false
            this.$router.push('/login')
        },
        syncLoginState() {
            this.isLoggedIn = !!localStorage.getItem('token')
        }
    },
    watch: {
        '$route'() {
            this.isLoggedIn = !!localStorage.getItem('token')
        }
    }
}
</script>

<style scoped>
.navbar {
    min-height: 56px;
}

.dropdown-content.menu {
    min-width: 120px;
}
</style>