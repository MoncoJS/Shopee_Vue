<template>
  <div class="coupon-management-container">
    <div class="coupon-card">
      <div class="coupon-management-header">
        <h1 class="coupon-management-title">การจัดการคูปอง</h1>
      </div>

      <!-- Coupon Creation Form -->
      <div class="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">สร้างคูปองใหม่</h2>
        <form @submit.prevent="createCoupon">
          <div class="coupon-form-grid">
            <div class="form-group">
              <label for="couponName" class="form-label">ชื่อคูปอง</label>
              <input type="text" id="couponName" v-model="newCoupon.name" class="input-bordered" required>
            </div>
            <div class="form-group">
              <label for="couponCode" class="form-label">รหัสคูปอง (เว้นว่างเพื่อสร้างอัตโนมัติ)</label>
              <input type="text" id="couponCode" v-model="newCoupon.code" class="input-bordered">
            </div>
            <div class="form-group">
              <label for="discountType" class="form-label">ประเภทส่วนลด</label>
              <select id="discountType" v-model="newCoupon.discountType" class="select-bordered" required>
                <option value="percentage">เปอร์เซ็นต์</option>
                <option value="fixed">จำนวนเงินคงที่</option>
              </select>
            </div>
            <div class="form-group">
              <label for="discountValue" class="form-label">มูลค่าส่วนลด</label>
              <input type="number" id="discountValue" v-model.number="newCoupon.discountValue" class="input-bordered" min="0" required>
            </div>
            <div class="form-group">
              <label for="expirationDate" class="form-label">วันหมดอายุ</label>
              <input type="date" id="expirationDate" v-model="newCoupon.expirationDate" class="input-bordered" required>
            </div>
            <div class="flex items-center">
              <input type="checkbox" id="isActive" v-model="newCoupon.isActive" class="checkbox-primary">
              <label for="isActive" class="ml-2 text-sm font-medium text-gray-700">ใช้งานอยู่</label>
            </div>
          </div>
          <button type="submit" class="btn-primary">สร้างคูปอง</button>
        </form>
      </div>

      <!-- Coupon List -->
      <div class="bg-white shadow-md rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">คูปองที่มีอยู่</h2>
        <div class="coupon-table-wrapper">
          <table class="coupon-table">
            <thead>
              <tr>
                <th>ชื่อ</th>
                <th>รหัส</th>
                <th>ประเภท</th>
                <th>มูลค่า</th>
                <th>หมดอายุ</th>
                <th>ใช้งาน</th>
                <th>การกระทำ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="coupon in coupons" :key="coupon._id">
                <td>{{ coupon.name }}</td>
                <td>{{ coupon.code }}</td>
                <td>{{ coupon.discountType === 'percentage' ? 'เปอร์เซ็นต์' : 'คงที่' }}</td>
                <td>{{ coupon.discountValue }}</td>
                <td>{{ new Date(coupon.expirationDate).toLocaleDateString() }}</td>
                <td>
                  <input type="checkbox" v-model="coupon.isActive" @change="toggleCouponStatus(coupon)" class="checkbox-primary">
                </td>
                <td>
                  <button @click="openDialogForEdit(coupon)" class="btn-action btn-edit">แก้ไข</button>
                  <button @click="deleteCoupon(coupon._id)" class="btn-action btn-delete">ลบ</button>
                </td>
              </tr>
              <tr v-if="coupons.length === 0">
                <td colspan="7" class="no-coupons-found">ไม่พบคูปอง</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Coupon Edit Dialog -->
      <div v-if="showDialog" class="dialog-backdrop">
        <div class="dialog">
          <h3 class="dialog-title">{{ isEditMode ? 'แก้ไขคูปอง' : 'สร้างคูปองใหม่' }}</h3>
          <form @submit.prevent="saveCoupon" class="dialog-form-grid">
            <div class="form-group">
              <label for="editCouponName" class="form-label">ชื่อคูปอง</label>
              <input type="text" id="editCouponName" v-model="editCoupon.name" class="input-bordered" required>
            </div>
            <div class="form-group">
              <label for="editCouponCode" class="form-label">รหัสคูปอง</label>
              <input type="text" id="editCouponCode" v-model="editCoupon.code" class="input-bordered" required>
            </div>
            <div class="form-group">
              <label for="editDiscountType" class="form-label">ประเภทส่วนลด</label>
              <select id="editDiscountType" v-model="editCoupon.discountType" class="select-bordered" required>
                <option value="percentage">เปอร์เซ็นต์</option>
                <option value="fixed">จำนวนเงินคงที่</option>
              </select>
            </div>
            <div class="form-group">
              <label for="editDiscountValue" class="form-label">มูลค่าส่วนลด</label>
              <input type="number" id="editDiscountValue" v-model.number="editCoupon.discountValue" class="input-bordered" min="0" required>
            </div>
            <div class="form-group">
              <label for="editExpirationDate" class="form-label">วันหมดอายุ</label>
              <input type="date" id="editExpirationDate" v-model="editCoupon.expirationDate" class="input-bordered" required>
            </div>
            <div class="flex items-center">
              <input type="checkbox" id="editIsActive" v-model="editCoupon.isActive" class="checkbox-primary">
              <label for="editIsActive" class="ml-2 text-sm font-medium text-gray-700">ใช้งานอยู่</label>
            </div>
            <div class="dialog-actions">
              <button type="button" class="btn-secondary" @click="showDialog = false">ยกเลิก</button>
              <button type="submit" class="btn-gradient">บันทึก</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';
import '@/styles/coupon-management.css';

export default {
  name: 'CouponManagement',
  data() {
    return {
      newCoupon: {
        name: '',
        code: '',
        discountType: 'percentage',
        discountValue: 0,
        expirationDate: '',
        isActive: true,
      },
      coupons: [],
      showDialog: false,
      isEditMode: false,
      editCoupon: {
        _id: null,
        name: '',
        code: '',
        discountType: 'percentage',
        discountValue: 0,
        expirationDate: '',
        isActive: true,
      },
    };
  },
  methods: {
    async fetchCoupons() {
      try {
        const response = await api.get('/coupons');
        this.coupons = response.data.data;
      } catch (error) {
        console.error('Error fetching coupons:', error);
        alert('Failed to fetch coupons.');
      }
    },
    async createCoupon() {
      try {
        await api.post('/coupons', this.newCoupon);
        alert('Coupon created successfully!');
        this.newCoupon = {
          name: '',
          code: '',
          discountType: 'percentage',
          discountValue: 0,
          expirationDate: '',
          isActive: true,
        };
        this.fetchCoupons();
      } catch (error) {
        console.error('Error creating coupon:', error);
        alert(error.response?.data?.message || 'Failed to create coupon.');
      }
    },
    async toggleCouponStatus(coupon) {
      try {
        await api.put(`/coupons/${coupon._id}`, { isActive: coupon.isActive });
        alert('Coupon status updated.');
      } catch (error) {
        console.error('Error updating coupon status:', error);
        alert(error.response?.data?.message || 'Failed to update coupon status.');
        coupon.isActive = !coupon.isActive; // Revert on error
      }
    },
    openDialogForEdit(coupon) {
      this.isEditMode = true;
      this.editCoupon = { ...coupon };
      // Format expirationDate for input type="date"
      if (this.editCoupon.expirationDate) {
        this.editCoupon.expirationDate = new Date(this.editCoupon.expirationDate).toISOString().split('T')[0];
      }
      this.showDialog = true;
    },
    async saveCoupon() {
      try {
        if (this.isEditMode) {
          await api.put(`/coupons/${this.editCoupon._id}`, this.editCoupon);
          alert('Coupon updated successfully!');
        } else {
          // This case should not be reached if openDialogForCreate is not implemented
          // For now, we only allow editing via this dialog
        }
        this.showDialog = false;
        this.fetchCoupons(); // Refresh list
      } catch (error) {
        console.error('Error saving coupon:', error);
        alert(error.response?.data?.message || 'Failed to save coupon.');
      }
    },
    async deleteCoupon(id) {
      if (confirm('Are you sure you want to delete this coupon?')) {
        try {
          await api.delete(`/coupons/${id}`);
          alert('Coupon deleted successfully!');
          this.fetchCoupons();
        } catch (error) {
          console.error('Error deleting coupon:', error);
          alert(error.response?.data?.message || 'Failed to delete coupon.');
        }
      }
    },
  },
  created() {
    this.fetchCoupons();
  },
};
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
