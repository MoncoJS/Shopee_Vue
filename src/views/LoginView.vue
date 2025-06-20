<template>
    <div class="flex flex-col items-center justify-center min-h-screen bg-base-200">
        <div class="w-full max-w-xs bg-white p-8 rounded shadow">
            <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>
            <form @submit.prevent="handleLogin">
                <div class="mb-4">
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
                <div v-if="errorMessage" class="text-red-500 mb-4 text-center">{{ errorMessage }}</div>
                <button type="submit" class="btn btn-primary w-full">
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