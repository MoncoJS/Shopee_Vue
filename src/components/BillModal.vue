<template>
  <div v-if="isVisible" class="bill-modal-overlay" @click="closeBill">
    <div class="bill-modal" @click.stop>
      <!-- Header -->
      <div class="bill-header">
        <h2 class="bill-title">
          <svg class="receipt-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.5 3.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2L7.5 3.5L6 2v14H4v2h16v-2h-2V2l-1.5 1.5zM17 16H7V4h10v12z"/>
            <path d="M9 6h6v2H9zm0 3h6v2H9zm0 3h4v2H9z"/>
          </svg>
          ใบเสร็จรับเงิน
        </h2>
        <button @click="closeBill" class="close-btn">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <!-- Bill Content -->
      <div class="bill-content">
        <!-- Order Info -->
        <div class="order-info">
          <div class="order-number">
            <strong>เลขที่ใบสั่งซื้อ:</strong> {{ billData.orderNumber }}
          </div>
          <div class="order-date">
            <strong>วันที่:</strong> {{ formatDate(billData.orderDate) }}
          </div>
          <div class="customer-info" v-if="billData.customerName">
            <strong>ลูกค้า:</strong> {{ billData.customerName }}
          </div>
        </div>

        <!-- Items List -->
        <div class="items-section">
          <h3>รายการสินค้า</h3>
          <div class="items-table">
            <div class="table-header">
              <div class="col-item">สินค้า</div>
              <div class="col-qty">จำนวน</div>
              <div class="col-price">ราคา/ชิ้น</div>
              <div class="col-total">รวม</div>
            </div>
            <div class="table-body">
              <div v-for="item in billData.items" :key="getItemKey(item)" class="table-row">
                <div class="col-item">
                  <div class="item-info">
                    <img v-if="getItemImage(item)" 
                         :src="getItemImageUrl(item)" 
                         :alt="getItemName(item)" 
                         class="item-image"
                         @error="handleImageError">
                    <div v-else class="item-placeholder">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21,19V5c0,-1.1 -0.9,-2 -2,-2H5c-1.1,0 -2,0.9 -2,2v14c0,1.1 0.9,2 2,2h14c1.1,0 2,-0.9 2,-2zM8.5,13.5l2.5,3.01L14.5,12l4.5,6H5l3.5,-4.5z"/>
                      </svg>
                    </div>
                    <div class="item-details">
                      <div class="item-name">{{ getItemName(item) }}</div>
                    </div>
                  </div>
                </div>
                <div class="col-qty">{{ item.quantity }}</div>
                <div class="col-price">฿{{ formatPrice(item.price) }}</div>
                <div class="col-total">฿{{ formatPrice(item.price * item.quantity) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="bill-summary">
          <div class="summary-row">
            <span>รวมราคาสินค้า:</span>
            <span>฿{{ formatPrice(billData.subtotal) }}</span>
          </div>
          
          <div v-if="billData.discount > 0" class="summary-row discount">
            <span>ส่วนลด{{ billData.couponCode ? ` (${billData.couponCode})` : '' }}:</span>
            <span>-฿{{ formatPrice(billData.discount) }}</span>
          </div>
          
          <div class="summary-row total">
            <span>ยอดรวมทั้งสิ้น:</span>
            <span>฿{{ formatPrice(billData.total) }}</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="bill-footer">
          <p class="thank-you">ขอบคุณที่ใช้บริการ</p>
          <p class="store-info">{{ billData.storeName || 'Shopee Clone Store' }}</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="bill-actions">
        <button @click="printBill" class="print-btn">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
          </svg>
          พิมพ์ใบเสร็จ
        </button>
        <button @click="downloadBill" class="download-btn">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
          ดาวน์โหลด PDF
        </button>
        <button @click="closeBill" class="ok-btn">
          ตกลง
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BillModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    billData: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    closeBill() {
      this.$emit('close')
    },
    
    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      return d.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    formatPrice(price) {
      return Number(price || 0).toLocaleString('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    
    getItemKey(item) {
      return item._id || `${item.product}_${item.price}`
    },
    
    getItemName(item) {
      if (item.product && typeof item.product === 'object') {
        return item.product.product_name || item.product.name || 'Unknown Product'
      }
      return item.productName || 'Unknown Product'
    },
    
    getItemImage(item) {
      if (item.product && typeof item.product === 'object') {
        return item.product.img || item.product.Product_img
      }
      return item.productImage || null
    },
    
    getItemImageUrl(item) {
      const imagePath = this.getItemImage(item)
      if (!imagePath) return null
      
      // If the image path is already a full URL, return it
      if (imagePath.startsWith('http')) {
        return imagePath
      }
      
      // If it's a relative path, construct the full URL
      const baseUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000'
      return `${baseUrl}/${imagePath}`
    },
    
    handleImageError(event) {
      // Hide the broken image and show placeholder
      event.target.style.display = 'none'
      const placeholder = event.target.parentNode.querySelector('.item-placeholder')
      if (placeholder) {
        placeholder.style.display = 'flex'
      }
    },
    
    printBill() {
      window.print()
    },
    
    downloadBill() {
      // You can implement PDF generation here
      // For now, we'll just trigger print
      this.printBill()
    }
  }
}
</script>

<style scoped>
.bill-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.bill-modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.bill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 2px solid #eee;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px 12px 0 0;
}

.bill-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.receipt-icon {
  width: 28px;
  height: 28px;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.close-btn svg {
  width: 20px;
  height: 20px;
  fill: white;
}

.bill-content {
  padding: 24px;
}

.order-info {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  border-left: 4px solid #667eea;
}

.order-info > div {
  margin-bottom: 8px;
}

.order-info > div:last-child {
  margin-bottom: 0;
}

.items-section h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.items-table {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  background: #f8f9fa;
  padding: 12px;
  font-weight: 600;
  color: #555;
  border-bottom: 1px solid #eee;
}

.table-body {
  display: contents;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
}

.table-row:last-child {
  border-bottom: none;
}

.col-item {
  padding-right: 8px;
}

.col-qty, .col-price, .col-total {
  text-align: center;
  font-weight: 500;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #eee;
}

.item-placeholder {
  width: 40px;
  height: 40px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 6px;
  display: none;
  align-items: center;
  justify-content: center;
  color: #999;
}

.item-placeholder svg {
  width: 20px;
  height: 20px;
}

.item-name {
  font-weight: 500;
  color: #333;
}

.bill-summary {
  margin-top: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #eee;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 16px;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.summary-row.discount {
  color: #e74c3c;
}

.summary-row.total {
  font-weight: 700;
  font-size: 18px;
  color: #2c3e50;
  padding-top: 12px;
  border-top: 2px solid #ddd;
  margin-top: 12px;
}

.bill-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.thank-you {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.store-info {
  color: #666;
  margin: 0;
}

.bill-actions {
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #eee;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

.bill-actions button {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.print-btn {
  background: #3498db;
  color: white;
}

.print-btn:hover {
  background: #2980b9;
}

.download-btn {
  background: #e67e22;
  color: white;
}

.download-btn:hover {
  background: #d35400;
}

.ok-btn {
  background: #27ae60;
  color: white;
}

.ok-btn:hover {
  background: #229954;
}

.bill-actions svg {
  width: 18px;
  height: 18px;
}

/* Print styles */
@media print {
  .bill-modal-overlay {
    position: static;
    background: none;
    padding: 0;
  }
  
  .bill-modal {
    box-shadow: none;
    border-radius: 0;
    max-height: none;
    overflow: visible;
  }
  
  .bill-header {
    background: none !important;
    color: black !important;
    border-radius: 0;
  }
  
  .close-btn {
    display: none;
  }
  
  .bill-actions {
    display: none;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .bill-modal {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }
  
  .table-header, .table-row {
    grid-template-columns: 2fr 80px 80px 80px;
    font-size: 14px;
  }
  
  .bill-actions {
    flex-direction: column;
  }
  
  .item-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .item-image {
    width: 30px;
    height: 30px;
  }
}
</style>
