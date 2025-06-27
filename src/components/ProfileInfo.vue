<template>
  <div class="profile-info-grid-card">
    <div class="profile-fields-grid">
      <div class="form-group">
        <label class="form-label">ชื่อผู้ใช้</label>
        <div class="input input-view">{{ user.username }}</div>
      </div>
      <div class="form-group">
        <label class="form-label">อีเมล</label>
        <div class="input input-view">{{ user.email }}</div>
      </div>
      <div class="form-group">
        <label class="form-label">ชื่อจริง</label>
        <div class="input input-view">{{ user.firstName || '-' }}</div>
      </div>
      <div class="form-group">
        <label class="form-label">นามสกุล</label>
        <div class="input input-view">{{ user.lastName || '-' }}</div>
      </div>
      <div class="form-group">
        <label class="form-label">เพศ</label>
        <div class="input input-view">{{ user.gender || '-' }}</div>
      </div>
    </div>
    <div class="profile-actions">
      <button class="btn btn-gradient" @click="showDialog = true">
        แก้ไขโปรไฟล์
      </button>
    </div>

    <div v-if="showDialog" class="dialog-backdrop">
      <div class="dialog">
        <h3 class="dialog-title">แก้ไขโปรไฟล์</h3>
        <form @submit.prevent="submitEdit" class="dialog-form-grid">
          <div class="form-group">
            <label class="form-label">ชื่อจริง</label>
            <input class="input input-bordered" v-model="editUser.firstName" autocomplete="off" />
          </div>
          <div class="form-group">
            <label class="form-label">นามสกุล</label>
            <input class="input input-bordered" v-model="editUser.lastName" autocomplete="off" />
          </div>
          <div class="form-group">
            <label class="form-label">อีเมล</label>
            <input class="input input-bordered" v-model="editUser.email" type="email" autocomplete="off" />
          </div>
          <div class="form-group">
            <label class="form-label">เพศ</label>
            <select class="input input-bordered" v-model="editUser.gender">
              <option value="">-</option>
              <option value="ชาย">ชาย</option>
              <option value="หญิง">หญิง</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>
          </div>
          <div class="dialog-actions">
            <button type="button" class="btn btn-secondary" @click="showDialog = false">ยกเลิก</button>
            <button type="submit" class="btn btn-gradient">บันทึก</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import "@/styles/profile.css"
export default {
  name: "ProfileInfo",
  props: {
    user: { type: Object, required: true }
  },
  data() {
    return {
      showDialog: false,
      editUser: {
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        gender: this.user.gender
      }
    }
  },
  watch: {
    user: {
      handler(newVal) {
        this.editUser = {
          firstName: newVal.firstName,
          lastName: newVal.lastName,
          email: newVal.email,
          gender: newVal.gender
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    submitEdit() {
      this.$emit('update-profile', { ...this.editUser })
      this.showDialog = false
    }
  }
}
</script>

<style scoped>
.profile-info-grid-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04); /* Very subtle shadow */
  padding: 2.5rem;
  max-width: 600px;
  margin: 2.5rem auto 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
  align-items: stretch;
  width: 100%;
  border: 1px solid #f5f5f5; /* Very light border */
}

.profile-fields-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem 1.8rem;
}

.profile-fields-grid .form-group:nth-child(1),
.profile-fields-grid .form-group:nth-child(2) {
  grid-column: span 2;
}

@media (max-width: 768px) {
  .profile-info-grid-card {
    max-width: 95vw;
    padding: 1.5rem;
    margin: 1rem auto 0 auto;
    border-radius: 10px;
    box-shadow: 0 1px 8px rgba(0,0,0,0.06);
  }
  .profile-fields-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .dialog {
    min-width: 0;
    width: 90vw;
    padding: 1.5rem;
    border-radius: 10px;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-label {
  font-weight: 500;
  color: #555;
  font-size: 0.9rem;
  margin-bottom: 0.2rem;
}

.input-view {
  background: #f8f8f8;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  font-size: 1rem;
  color: #333;
  min-height: 40px;
  display: flex;
  align-items: center;
}

.input-bordered {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #fff;
}
.input-bordered:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.1);
}

select.input-bordered {
  appearance: none;
  background: #fff url("data:image/svg+xml,%3Csvg width='16' height='16' fill='gray' viewBox='0 0 16 16'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E") no-repeat right 0.8rem center/1rem;
}

.profile-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn {
  padding: 0.8rem 1.8rem;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
}

.btn-gradient {
  background-color: #007bff; /* Solid primary color */
  color: #fff;
  box-shadow: 0 1px 6px rgba(0, 123, 255, 0.1); /* Subtle shadow */
}

.btn-gradient:hover {
  background-color: #0056b3;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.15);
}

.btn-secondary {
  background-color: #e9ecef;
  color: #495057;
}

.btn-secondary:hover {
  background-color: #dee2e6;
}

.dialog-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.15); /* Lighter overlay */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: #fff;
  padding: 2rem;
  border-radius: 16px;
  min-width: 350px;
  max-width: 90vw;
  box-shadow: 0 8px 30px rgba(0,0,0,0.15); /* Lighter shadow */
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: dialogPop 0.2s cubic-bezier(.4,1.6,.6,1) both;
}

.dialog-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem 1.8rem;
}

.dialog-form-grid .form-group:nth-child(3) {
  grid-column: span 2;
}

@media (max-width: 768px) {
  .dialog-form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@keyframes dialogPop {
  0% { transform: scale(0.98); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.dialog-title {
  margin-bottom: 0.8rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  text-align: center;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  grid-column: span 2;
}
</style>
