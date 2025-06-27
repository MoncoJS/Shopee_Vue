<template>
    <div class="login-bg">
        <div class="login-container">
            <div class="login-icon">
                <span>🔐</span>
            </div>
            <h2 class="login-title">เข้าสู่ระบบ</h2>
            <form @submit.prevent="handleLogin" class="login-form">
                <div class="form-group">
                    <label class="form-label" for="username">
                        Username
                    </label>
                    <input id="username" type="text" class="input input-bordered"
                        placeholder="Enter your username" v-model="username" />
                </div>
                <div class="form-group">
                    <label class="form-label" for="password">
                        Password
                    </label>
                    <input id="password" type="password" class="input input-bordered"
                        placeholder="Enter your password" v-model="password" />
                </div>
                <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
                <button type="submit" class="btn btn-gradient">
                    Login
                </button>
                <div class="login-footer mt-6 text-sm">
                    <span>ยังไม่มีบัญชี?</span>
                    <router-link to="/register" class="login-link text-blue-500 hover:underline ml-1">สมัครสมาชิก</router-link>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import "@/styles/login_register.css"
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
                    await this.$store.dispatch('fetchUser'); // Fetch user data after successful login
                    this.$router.push('/products')
                } else {
                    this.errorMessage = 'Login failed: Invalid response'
                }
            } catch (error) {
                this.errorMessage = error.response?.data?.message || 'Login failed'
                // console.error('Login error:', error)
            }
        },
        handleLogin() {
            this.login()
        }
    }
}
</script>