<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>🛒 Shopee Login</h1>
        <p>เข้าสู่ระบบเพื่อเริ่มต้นช้อปปิ้ง</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">ชื่อผู้ใช้</label>
          <input
            id="username"
            type="text"
            v-model="form.username"
            placeholder="กรอกชื่อผู้ใช้"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">รหัสผ่าน</label>
          <input
            id="password"
            type="password"
            v-model="form.password"
            placeholder="กรอกรหัสผ่าน"
            required
          />
        </div>

        <button type="submit" :disabled="loading" class="login-btn">
          <span v-if="loading">กำลังเข้าสู่ระบบ...</span>
          <span v-else>เข้าสู่ระบบ</span>
        </button>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </form>

      <div class="login-footer">
        <p>ยังไม่มีบัญชี? <router-link to="/register">สมัครสมาชิก</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'LoginView',
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      loading: false,
      errorMessage: ''
    };
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.errorMessage = '';

      try {
        const response = await api.post('/auth/login', this.form);
        
        if (response.data.success) {
          // Store token
          localStorage.setItem('token', response.data.data.token);
          
          // Update Vuex store
          await this.$store.dispatch('fetchUser');
          
          // Redirect to products page
          this.$router.push('/products');
        } else {
          this.errorMessage = response.data.message || 'เข้าสู่ระบบไม่สำเร็จ';
        }
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    // Redirect if already logged in
    if (localStorage.getItem('token')) {
      this.$router.push('/products');
    }
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 10px;
  padding: 40px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  color: #333;
  margin-bottom: 10px;
  font-size: 28px;
}

.login-header p {
  color: #666;
  margin: 0;
}

.login-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.login-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 10px;
  border-radius: 4px;
  margin-top: 15px;
  text-align: center;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
}

.login-footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.login-footer a:hover {
  text-decoration: underline;
}
</style>
