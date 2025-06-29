<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1>🛒 สมัครสมาชิก Shopee</h1>
        <p>สร้างบัญชีใหม่เพื่อเริ่มต้นช้อปปิ้ง</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">ชื่อ</label>
            <input
              id="firstName"
              type="text"
              v-model="form.firstName"
              placeholder="กรอกชื่อ"
              required
            />
          </div>
          <div class="form-group">
            <label for="lastName">นามสกุล</label>
            <input
              id="lastName"
              type="text"
              v-model="form.lastName"
              placeholder="กรอกนามสกุล"
              required
            />
          </div>
        </div>

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
          <label for="email">อีเมล</label>
          <input
            id="email"
            type="email"
            v-model="form.email"
            placeholder="กรอกอีเมล"
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

        <div class="form-group">
          <label for="confirmPassword">ยืนยันรหัสผ่าน</label>
          <input
            id="confirmPassword"
            type="password"
            v-model="form.confirmPassword"
            placeholder="กรอกรหัสผ่านอีกครั้ง"
            required
          />
        </div>

        <div class="form-group">
          <label for="gender">เพศ</label>
          <select id="gender" v-model="form.gender">
            <option value="">เลือกเพศ</option>
            <option value="male">ชาย</option>
            <option value="female">หญิง</option>
            <option value="other">อื่นๆ</option>
          </select>
        </div>

        <button type="submit" :disabled="loading" class="register-btn">
          <span v-if="loading">กำลังสมัครสมาชิก...</span>
          <span v-else>สมัครสมาชิก</span>
        </button>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
      </form>

      <div class="register-footer">
        <p>มีบัญชีอยู่แล้ว? <router-link to="/login">เข้าสู่ระบบ</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'RegisterView',
  data() {
    return {
      form: {
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        gender: ''
      },
      loading: false,
      errorMessage: '',
      successMessage: ''
    };
  },
  methods: {
    async handleRegister() {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      // Validate required fields
      if (!this.form.firstName.trim()) {
        this.errorMessage = 'กรุณากรอกชื่อ';
        this.loading = false;
        return;
      }

      if (!this.form.lastName.trim()) {
        this.errorMessage = 'กรุณากรอกนามสกุล';
        this.loading = false;
        return;
      }

      if (!this.form.username.trim()) {
        this.errorMessage = 'กรุณากรอกชื่อผู้ใช้';
        this.loading = false;
        return;
      }

      if (!this.form.email.trim()) {
        this.errorMessage = 'กรุณากรอกอีเมล';
        this.loading = false;
        return;
      }

      if (!this.form.password) {
        this.errorMessage = 'กรุณากรอกรหัสผ่าน';
        this.loading = false;
        return;
      }

      // Validate passwords match
      if (this.form.password !== this.form.confirmPassword) {
        this.errorMessage = 'รหัสผ่านไม่ตรงกัน';
        this.loading = false;
        return;
      }

      // Validate password strength
      if (this.form.password.length < 6) {
        this.errorMessage = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
        this.loading = false;
        return;
      }

      try {
        const registerData = {
          username: this.form.username.trim(),
          email: this.form.email.trim(),
          password: this.form.password,
          firstName: this.form.firstName.trim(),
          lastName: this.form.lastName.trim(),
          gender: this.form.gender || ''
        };
        
        const response = await api.post('/auth/register', registerData);
        
        if (response.data.success) {
          this.successMessage = 'สมัครสมาชิกสำเร็จ! กำลังเปลี่ยนเส้นทางไปหน้าเข้าสู่ระบบ...';
          
          setTimeout(() => {
            this.$router.push('/login');
          }, 2000);
        } else {
          this.errorMessage = response.data.message || 'สมัครสมาชิกไม่สำเร็จ';
        }
      } catch (error) {
        if (error.response?.status === 400) {
          this.errorMessage = error.response.data?.message || 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';
        } else if (error.response?.status === 409) {
          this.errorMessage = 'ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้ไปแล้ว';
        } else {
          this.errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก';
        }
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
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-card {
  background: white;
  border-radius: 10px;
  padding: 40px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h1 {
  color: #333;
  margin-bottom: 10px;
  font-size: 28px;
}

.register-header p {
  color: #666;
  margin: 0;
}

.register-form {
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-group {
  margin-bottom: 20px;
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #333;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.register-btn {
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

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.register-btn:disabled {
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

.success-message {
  background: #efe;
  color: #3c3;
  padding: 10px;
  border-radius: 4px;
  margin-top: 15px;
  text-align: center;
}

.register-footer {
  text-align: center;
  margin-top: 20px;
}

.register-footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.register-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>
