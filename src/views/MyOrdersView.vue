<template>
  <div class="my-orders-page">
    <div class="page-header">
      <h1>ประวัติการสั่งซื้อของฉัน</h1>
      <p>ดูประวัติการสั่งซื้อและใบเสร็จทั้งหมดของคุณ</p>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>กำลังโหลดข้อมูล...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>เกิดข้อผิดพลาด</h3>
      <p>{{ error }}</p>
      <button @click="loadMyBills" class="retry-btn">ลองใหม่อีกครั้ง</button>
    </div>

    <div v-else-if="bills.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <h3>ยังไม่มีประวัติการสั่งซื้อ</h3>
      <p>เมื่อคุณสั่งซื้อสินค้า ประวัติจะปรากฏที่นี่</p>
      <router-link to="/products" class="shop-now-btn">เริ่มช้อปปิ้ง</router-link>
    </div>

    <div v-else class="bills-container">
      <div class="bills-summary">
        <p>พบใบเสร็จทั้งหมด {{ bills.length }} รายการ</p>
      </div>

      <div class="bills-grid">
        <div v-for="bill in bills" :key="bill._id" class="bill-card">
          <div class="bill-header">
            <div class="bill-number">
              <div class="receipt-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
              </div>
              <div class="receipt-details">
                <span class="receipt-label">เลขที่ใบเสร็จ</span>
                <span class="receipt-number">{{ bill.orderNumber }}</span>
              </div>
            </div>
            <div class="bill-date">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z"/>
              </svg>
              <span>{{ formatDate(bill.createdAt) }}</span>
            </div>
          </div>

          <div class="bill-items">
            <div class="items-header">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M7,18C5.89,18 5,18.89 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20C9,18.89 8.1,18 7,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75C7.17,14.7 7.18,14.66 7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5H5.21L4.27,3H1M19,18C17.89,18 17,18.89 17,20A2,2 0 0,0 19,22A2,2 0 0,0 21,20C21,18.89 20.1,18 19,18Z"/>
              </svg>
              <span>รายการสินค้า ({{ bill.items.length }} รายการ)</span>
            </div>
            <div class="items-list">
              <div v-for="item in bill.items.slice(0, 2)" :key="item._id" class="item-row">
                <div class="item-info">
                  <span class="item-name">{{ item.productName }}</span>
                  <span class="item-qty">x{{ item.quantity }}</span>
                </div>
                <span class="item-price">฿{{ (item.price * item.quantity).toLocaleString() }}</span>
              </div>
              <div v-if="bill.items.length > 2" class="more-items">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z"/>
                </svg>
                <span>และอีก {{ bill.items.length - 2 }} รายการ</span>
              </div>
            </div>
          </div>

          <div class="bill-summary">
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-label">รวมย่อย</span>
                <span class="summary-value">฿{{ bill.subtotal.toLocaleString() }}</span>
              </div>
              <div v-if="bill.discount > 0" class="summary-item discount">
                <span class="summary-label">ส่วนลด</span>
                <span class="summary-value">-฿{{ bill.discount.toLocaleString() }}</span>
              </div>
            </div>
            <div class="total-section">
              <span class="total-label">ยอดรวมทั้งสิ้น</span>
              <span class="total-value">฿{{ bill.totalAmount.toLocaleString() }}</span>
            </div>
          </div>

          <div class="bill-actions">
            <button @click="showBillDetail(bill)" class="view-detail-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
              </svg>
              <span>ดูรายละเอียดเต็ม</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bill Detail Modal -->
    <div v-if="selectedBill" class="modal-overlay" @click="closeBillDetail">
      <div class="bill-detail-modal" @click.stop>
        <div class="modal-header">
          <h2>ใบเสร็จรับเงิน</h2>
          <button @click="closeBillDetail" class="close-btn">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
          </button>
        </div>

        <div class="modal-content">
          <div class="bill-info">
            <div class="info-row">
              <span class="label">เลขที่ใบเสร็จ:</span>
              <span class="value">{{ selectedBill.orderNumber }}</span>
            </div>
            <div class="info-row">
              <span class="label">วันที่:</span>
              <span class="value">{{ formatDate(selectedBill.createdAt) }}</span>
            </div>
          </div>

          <div class="bill-items-detail">
            <h3>รายการสินค้า</h3>
            <div class="items-table">
              <div class="table-header">
                <span>สินค้า</span>
                <span>จำนวน</span>
                <span>ราคา/หน่วย</span>
                <span>รวม</span>
              </div>
              <div v-for="item in selectedBill.items" :key="item._id" class="table-row">
                <span class="product-name">{{ item.productName }}</span>
                <span class="quantity">{{ item.quantity }}</span>
                <span class="unit-price">฿{{ item.price.toLocaleString() }}</span>
                <span class="total-price">฿{{ (item.price * item.quantity).toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <div class="bill-totals-detail">
            <div class="total-row">
              <span>รวมย่อย:</span>
              <span>฿{{ selectedBill.subtotal.toLocaleString() }}</span>
            </div>
            <div v-if="selectedBill.discount > 0" class="total-row discount">
              <span>ส่วนลด:</span>
              <span>-฿{{ selectedBill.discount.toLocaleString() }}</span>
            </div>
            <div class="total-row final">
              <span>ยอดรวมทั้งสิ้น:</span>
              <span>฿{{ selectedBill.totalAmount.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api'

export default {
  name: 'MyOrdersView',
  data() {
    return {
      bills: [],
      loading: true,
      error: '',
      selectedBill: null
    }
  },
  async created() {
    // ตรวจสอบการเข้าสู่ระบบ
    if (!this.$store.state.user) {
      this.$router.replace('/login')
      return
    }
    await this.loadMyBills()
  },
  methods: {
    async loadMyBills() {
      this.loading = true
      this.error = ''
      try {
        const res = await api.get('/bills/my')
        this.bills = res.data.data || []
      } catch (e) {
        this.error = e.response?.data?.message || 'โหลดข้อมูลล้มเหลว'
        console.error('Error loading bills:', e)
      } finally {
        this.loading = false
      }
    },
    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    showBillDetail(bill) {
      this.selectedBill = bill
    },
    closeBillDetail() {
      this.selectedBill = null
    }
  }
}
</script>

<style scoped>
.my-orders-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 30px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  color: white;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
}

.page-header::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 150px;
  height: 150px;
  background: rgba(255,255,255,0.08);
  border-radius: 50%;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  position: relative;
  z-index: 1;
}

.page-header p {
  font-size: 1.1rem;
  opacity: 0.95;
  position: relative;
  z-index: 1;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error State */
.error-state {
  text-align: center;
  padding: 60px 20px;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.retry-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 20px;
}

.retry-btn:hover {
  background: #2980b9;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border-radius: 20px;
  border: 2px dashed #dee2e6;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 24px;
  opacity: 0.7;
}

.empty-state h3 {
  color: #495057;
  margin-bottom: 12px;
  font-size: 1.5rem;
}

.empty-state p {
  color: #6c757d;
  margin-bottom: 24px;
}

.shop-now-btn {
  display: inline-block;
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  padding: 14px 28px;
  border-radius: 25px;
  text-decoration: none;
  margin-top: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
}

.shop-now-btn:hover {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(39, 174, 96, 0.4);
  text-decoration: none;
}

/* Bills Container */
.bills-summary {
  margin-bottom: 24px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 12px;
  border-left: 4px solid #667eea;
  color: #495057;
  font-weight: 500;
}

.bills-grid {
  display: grid;
  gap: 24px;
}

/* Bill Card */
.bill-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.bill-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
}

.bill-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.bill-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20px;
  width: 100px;
  height: 100px;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
}

.bill-number {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.receipt-icon {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.receipt-icon svg {
  width: 20px;
  height: 20px;
}

.receipt-details {
  display: flex;
  flex-direction: column;
}

.receipt-label {
  font-size: 0.85rem;
  opacity: 0.9;
  margin-bottom: 2px;
}

.receipt-number {
  font-weight: 600;
  font-size: 1.1rem;
  font-family: 'Courier New', monospace;
}

.bill-date {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  opacity: 0.95;
}

.bill-date svg {
  width: 16px;
  height: 16px;
}

.bill-items {
  padding: 24px;
  background: white;
}

.items-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  color: #495057;
  font-weight: 600;
}

.items-header svg {
  width: 18px;
  height: 18px;
  color: #6c757d;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 10px;
  margin-bottom: 8px;
  transition: background-color 0.2s;
}

.item-row:hover {
  background: #e9ecef;
}

.item-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.item-name {
  color: #2c3e50;
  font-weight: 500;
  margin-bottom: 4px;
}

.item-qty {
  color: #6c757d;
  font-size: 0.85rem;
  background: #dee2e6;
  padding: 2px 8px;
  border-radius: 12px;
  width: fit-content;
}

.item-price {
  font-weight: 600;
  color: #27ae60;
  font-size: 1.05rem;
}

.more-items {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  color: #6c757d;
  font-style: italic;
  background: #f1f3f4;
  border-radius: 8px;
  margin-top: 8px;
}

.more-items svg {
  width: 16px;
  height: 16px;
}

.bill-summary {
  padding: 20px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.summary-grid {
  margin-bottom: 16px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 0.95rem;
}

.summary-item.discount {
  color: #e74c3c;
}

.summary-label {
  color: #6c757d;
}

.summary-value {
  font-weight: 500;
  color: #2c3e50;
}

.summary-item.discount .summary-value {
  color: #e74c3c;
}

.total-section {
  display: flex;
  justify-content: space-between;
  padding: 16px 0 8px 0;
  border-top: 2px solid #dee2e6;
  align-items: center;
}

.total-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.1rem;
}

.total-value {
  font-weight: 700;
  font-size: 1.4rem;
  color: #27ae60;
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.bill-actions {
  padding: 20px 24px;
  background: white;
  text-align: center;
}

.view-detail-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.view-detail-btn:hover {
  background: linear-gradient(135deg, #2980b9, #3498db);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
}

.view-detail-btn svg {
  width: 16px;
  height: 16px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.bill-detail-modal {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.close-btn svg {
  width: 24px;
  height: 24px;
  color: #7f8c8d;
}

.close-btn:hover svg {
  color: #2c3e50;
}

.modal-content {
  padding: 20px;
}

.bill-info {
  margin-bottom: 24px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f1f2f6;
}

.info-row .label {
  color: #7f8c8d;
}

.info-row .value {
  font-weight: 600;
  color: #2c3e50;
}

.bill-items-detail h3 {
  margin: 0 0 16px 0;
  color: #2c3e50;
}

.items-table {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  overflow: hidden;
}

.table-header {
  background: #f8f9fa;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 12px;
  padding: 12px;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 1px solid #e9ecef;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #f1f2f6;
}

.table-row:last-child {
  border-bottom: none;
}

.bill-totals-detail {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 2px solid #e9ecef;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.total-row.discount {
  color: #e74c3c;
}

.total-row.final {
  font-weight: 600;
  font-size: 1.2rem;
  color: #27ae60;
  border-top: 1px solid #dee2e6;
  padding-top: 12px;
  margin-top: 8px;
}

/* Responsive */
@media (max-width: 768px) {
  .my-orders-page {
    padding: 16px;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .bill-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }
  
  .table-header span,
  .table-row span {
    padding: 4px 0;
  }
  
  .modal-overlay {
    padding: 10px;
  }
}
</style>
