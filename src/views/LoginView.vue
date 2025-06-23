<template>
    <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-green-100">
        <div class="w-full max-w-sm bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 flex flex-col items-center">
            <div class="mb-4">
                <span class="text-5xl text-green-400">🔐</span>
            </div>
            <h2 class="text-3xl font-extrabold mb-8 text-center text-green-700 tracking-tight">เข้าสู่ระบบ</h2>
            <form @submit.prevent="handleLogin" class="w-full">
                <div class="mb-5">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
                        Username
                    </label>
                    <input id="username" type="text" class="input input-bordered w-full"
                        placeholder="Enter your username" v-model="username" />
                </div>
                <div class="mb-6">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
                        Password
                    </label>
                    <input id="password" type="password" class="input input-bordered w-full"
                        placeholder="Enter your password" v-model="password" />
                </div>
                <div v-if="errorMessage" class="text-red-500 mb-4 text-center font-medium">{{ errorMessage }}</div>
                <button type="submit"
                    class="btn w-full rounded-xl bg-gradient-to-r from-green-400 to-blue-400 text-white font-semibold text-lg shadow-lg hover:from-blue-400 hover:to-green-400 transition-all">
                    Login
                </button>
            </form>
        </div>
    </div>
</template>

<script>
import axios from 'axios'

export default {
    data() {
        return {
            username: '',
            password: '',
            errorMessage: ''
        }
    },
    methods: {
        async login() {
            // ฟังก์ชันสำหรับ login
            this.errorMessage = ''
            try {
                const response = await axios.post('http://localhost:3000/login', {
                    username: this.username,
                    password: this.password
                })
                if (response.data && response.data.data && response.data.data.token) {
                    localStorage.setItem('token', response.data.data.token)
                    this.$router.push('/products')
                } else {
                    this.errorMessage = 'Login failed: Invalid response'
                }
            } catch (error) {
                this.errorMessage = error.response?.data?.message || 'Login failed'
                console.error('Login error:', error)
            }
        },
        handleLogin() {
            this.login()
        }
    }
}
</script>