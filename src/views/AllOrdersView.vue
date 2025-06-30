<template>
  <div class="all-orders-page">
    <h1>รายการใบเสร็จทั้งหมด (Admin เท่านั้น)</h1>
    <div v-if="loading">กำลังโหลด...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <table class="orders-table">
        <thead>
          <tr>
            <th>เลขที่ใบเสร็จ</th>
            <th>ผู้ใช้</th>
            <th>วันที่</th>
            <th>ยอดรวม</th>
            <th>รายละเอียด</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="bill in bills" :key="bill._id">
            <td>{{ bill.orderNumber }}</td>
            <td>{{ bill.userId?.username || bill.userId?.email || bill.userId }}</td>
            <td>{{ formatDate(bill.createdAt) }}</td>
            <td>฿{{ bill.totalAmount }}</td>
            <td>
              <button @click="showBill(bill)">ดู</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="selectedBill" class="bill-detail-modal">
        <h2>รายละเอียดใบเสร็จ</h2>
        <div class="bill-info">
          <p><strong>เลขที่ใบเสร็จ:</strong> {{ selectedBill.orderNumber }}</p>
          <p><strong>วันที่:</strong> {{ formatDate(selectedBill.createdAt) }}</p>
          <p><strong>ผู้ซื้อ:</strong> {{ selectedBill.userId?.username || selectedBill.userId?.email }}</p>
          <h3>รายการสินค้า:</h3>
          <div v-for="item in selectedBill.items" :key="item._id" class="bill-item">
            <p>{{ item.productName }} x {{ item.quantity }} = ฿{{ item.price * item.quantity }}</p>
          </div>
          <div class="bill-totals">
            <p><strong>รวมย่อย:</strong> ฿{{ selectedBill.subtotal }}</p>
            <p v-if="selectedBill.discount > 0"><strong>ส่วนลด:</strong> ฿{{ selectedBill.discount }}</p>
            <p class="total"><strong>ยอดรวมทั้งสิ้น:</strong> ฿{{ selectedBill.totalAmount }}</p>
          </div>
        </div>
        <button @click="selectedBill = null">ปิด</button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api'
export default {
  name: 'AllOrdersView',
  data() {
    return {
      bills: [],
      loading: true,
      error: '',
      selectedBill: null
    }
  },
  async created() {
    // ตรวจสอบสิทธิ์ admin
    const user = this.$store.state.user
    if (!user || !user.isAdmin) {
      this.$router.replace('/')
      return
    }
    try {
      const res = await api.get('/bills/all')
      this.bills = res.data.data || []
    } catch (e) {
      this.error = e.response?.data?.message || 'โหลดข้อมูลล้มเหลว'
    } finally {
      this.loading = false
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleString('th-TH')
    },
    showBill(bill) {
      this.selectedBill = bill
    }
  }
}
</script>

<style scoped>
.all-orders-page { max-width: 900px; margin: 40px auto; background: #fff; padding: 32px; border-radius: 12px; box-shadow: 0 2px 12px #0001; }
.orders-table { width: 100%; border-collapse: collapse; margin-top: 24px; }
.orders-table th, .orders-table td { border: 1px solid #eee; padding: 8px 12px; text-align: left; }
.orders-table th { background: #f8f8f8; }
.error { color: #e74c3c; margin: 16px 0; }
.bill-detail-modal { background: #f9f9f9; border: 1px solid #ddd; padding: 24px; margin-top: 24px; border-radius: 8px; }
.bill-info { margin: 16px 0; }
.bill-item { background: #fff; padding: 8px; margin: 4px 0; border-radius: 4px; border: 1px solid #eee; }
.bill-totals { margin-top: 16px; padding-top: 16px; border-top: 2px solid #ddd; }
.bill-totals .total { font-size: 1.2em; color: #27ae60; }
</style>
