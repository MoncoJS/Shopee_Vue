<template>
  <div class="register-bg">
    <div class="register-container">
      <h2 class="register-title">สมัครสมาชิก</h2>
      <form @submit.prevent="register">
        <div class="form-group">
          <label class="form-label">ชื่อผู้ใช้</label>
          <input v-model="form.username" type="text" required class="input input-bordered" />
        </div>
        <div class="form-group">
          <label class="form-label">อีเมล</label>
          <input v-model="form.email" type="email" required class="input input-bordered" />
        </div>
        <div class="form-group">
          <label class="form-label">รหัสผ่าน</label>
          <input v-model="form.password" type="password" required minlength="6" class="input input-bordered" />
        </div>
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <button type="submit" class="btn btn-gradient">
          สมัครสมาชิก
        </button>
      </form>
      <div class="register-footer">
        มีบัญชีอยู่แล้ว?
        <router-link to="/login" class="register-link">เข้าสู่ระบบ</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import "@/styles/login_register.css"
export default {
  name: "RegisterView",
  data() {
    return {
      form: {
        username: "",
        password: "",
        email: ""
      },
      errorMessage: ""
    }
  },
  methods: {
    async register() {
      this.errorMessage = "";
      // ตรวจสอบข้อมูลเบื้องต้น
      if (!this.form.username || !this.form.password || !this.form.email) {
        this.errorMessage = "กรุณากรอกข้อมูลให้ครบถ้วน";
        return;
      }
      try {
        const res = await fetch("http://localhost:3000/users/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "cors",
          body: JSON.stringify(this.form)
        });
        if (res.status === 401) {
          this.errorMessage = "ไม่สามารถสมัครสมาชิกได้ กรุณาติดต่อผู้ดูแลระบบ";
          return;
        }
        const data = await res.json();
        if (!data.success) {
          this.errorMessage = data.message || "สมัครสมาชิกไม่สำเร็จ";
        } else {
          this.$router.push("/login");
        }
      } catch (e) {
        this.errorMessage = "เกิดข้อผิดพลาดในการสมัครสมาชิก";
      }
    }
  }
}
</script>
