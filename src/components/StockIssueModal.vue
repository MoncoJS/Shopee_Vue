<template>
  <div v-if="isVisible" class="stock-modal-overlay" @click="close">
    <div class="stock-modal" @click.stop>
      <!-- Header -->
      <div class="stock-header">
        <h2 class="stock-title">
          <svg class="warning-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
          ปัญหาสินค้าในตะกร้า
        </h2>
        <button @click="close" class="close-btn">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="stock-content">
        <!-- Out of Stock Items -->
        <div v-if="outOfStockItems.length > 0" class="stock-section">
          <h3 class="section-title out-of-stock">
            <svg class="section-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            สินค้าที่หมดแล้ว ({{ outOfStockItems.length }} รายการ)
          </h3>
          <div class="items-list">
            <div v-for="item in outOfStockItems" :key="item._id" class="stock-item out-of-stock">
              <img v-if="getItemImage(item)" :src="getItemImageUrl(item)" :alt="item.productName" class="item-image">
              <div v-else class="item-placeholder">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21,19V5c0,-1.1 -0.9,-2 -2,-2H5c-1.1,0 -2,0.9 -2,2v14c0,1.1 0.9,2 2,2h14c1.1,0 2,-0.9 2,-2zM8.5,13.5l2.5,3.01L14.5,12l4.5,6H5l3.5,-4.5z"/>
                </svg>
              </div>
              <div class="item-details">
                <div class="item-name">{{ item.productName }}</div>
                <div class="item-status">ต้องการ {{ item.quantity }} ชิ้น - <span class="status-text">หมดแล้ว</span></div>
              </div>
              <div class="item-actions">
                <button @click="removeOutOfStockItem(item)" class="remove-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c0-1.1-.9-2-2-2H8c-1.1 0-2-.9-2-2zm0-2h12V5H6v12zM8 7h8v8H8V7z"/>
                  </svg>
                  ลบออก
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Low Stock Items -->
        <div v-if="lowStockItems.length > 0" class="stock-section">
          <h3 class="section-title low-stock">
            <svg class="section-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
            สินค้าที่เหลือไม่เพียงพอ ({{ lowStockItems.length }} รายการ)
          </h3>
          <div class="items-list">
            <div v-for="item in lowStockItems" :key="item._id" class="stock-item low-stock">
              <img v-if="getItemImage(item)" :src="getItemImageUrl(item)" :alt="item.productName" class="item-image">
              <div v-else class="item-placeholder">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21,19V5c0,-1.1 -0.9,-2 -2,-2H5c-1.1,0 -2,0.9 -2,2v14c0,1.1 0.9,2 2,2h14c1.1,0 2,-0.9 2,-2zM8.5,13.5l2.5,3.01L14.5,12l4.5,6H5l3.5,-4.5z"/>
                </svg>
              </div>
              <div class="item-details">
                <div class="item-name">{{ item.productName }}</div>
                <div class="item-status">
                  ต้องการ {{ item.requestedQuantity }} ชิ้น - 
                  <span class="status-text">เหลือ {{ item.currentStock }} ชิ้น</span>
                </div>
              </div>
              <div class="item-actions">
                <button @click="adjustQuantity(item)" class="adjust-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                  ปรับเป็น {{ item.currentStock }}
                </button>
                <button @click="removeLowStockItem(item)" class="remove-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c0-1.1-.9-2-2-2H8c-1.1 0-2-.9-2-2zm0-2h12V5H6v12zM8 7h8v8H8V7z"/>
                  </svg>
                  ลบออก
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="stock-actions">
        <button @click="autoFix" class="auto-fix-btn">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
          </svg>
          แก้ไขอัตโนมัติ
        </button>
        <button @click="close" class="cancel-btn">
          ยกเลิก
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StockIssueModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    outOfStockItems: {
      type: Array,
      default: () => []
    },
    lowStockItems: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    close() {
      this.$emit('close')
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
      
      if (imagePath.startsWith('http')) {
        return imagePath
      }
      
      const baseUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000'
      return `${baseUrl}/${imagePath}`
    },

    removeOutOfStockItem(item) {
      this.$emit('remove-item', item)
    },

    removeLowStockItem(item) {
      this.$emit('remove-item', item)
    },

    adjustQuantity(item) {
      this.$emit('adjust-quantity', {
        item,
        newQuantity: item.currentStock
      })
    },

    async autoFix() {
      // Remove all out of stock items and adjust low stock quantities
      const actions = []
      
      // Remove out of stock items
      for (const item of this.outOfStockItems) {
        actions.push({ type: 'remove', item })
      }
      
      // Adjust low stock items
      for (const item of this.lowStockItems) {
        actions.push({ 
          type: 'adjust', 
          item, 
          newQuantity: item.currentStock 
        })
      }
      
      this.$emit('auto-fix', actions)
    }
  }
}
</script>

<style scoped>
.stock-modal-overlay {
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

.stock-modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.stock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 2px solid #eee;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  border-radius: 12px 12px 0 0;
}

.stock-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.warning-icon {
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

.stock-content {
  padding: 24px;
}

.stock-section {
  margin-bottom: 32px;
}

.stock-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
}

.section-title.out-of-stock {
  color: #e74c3c;
}

.section-title.low-stock {
  color: #f39c12;
}

.section-icon {
  width: 20px;
  height: 20px;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stock-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid #eee;
  border-radius: 8px;
  background: #f8f9fa;
}

.stock-item.out-of-stock {
  border-color: #e74c3c;
  background: #fdf2f2;
}

.stock-item.low-stock {
  border-color: #f39c12;
  background: #fef9e7;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 16px;
}

.item-placeholder {
  width: 60px;
  height: 60px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  margin-right: 16px;
}

.item-placeholder svg {
  width: 30px;
  height: 30px;
}

.item-details {
  flex: 1;
  margin-right: 16px;
}

.item-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.item-status {
  color: #666;
  font-size: 14px;
}

.status-text {
  font-weight: 600;
}

.out-of-stock .status-text {
  color: #e74c3c;
}

.low-stock .status-text {
  color: #f39c12;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.adjust-btn, .remove-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.adjust-btn {
  background: #3498db;
  color: white;
}

.adjust-btn:hover {
  background: #2980b9;
}

.remove-btn {
  background: #e74c3c;
  color: white;
}

.remove-btn:hover {
  background: #c0392b;
}

.adjust-btn svg, .remove-btn svg {
  width: 14px;
  height: 14px;
}

.stock-actions {
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #eee;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

.auto-fix-btn, .cancel-btn {
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

.auto-fix-btn {
  background: #27ae60;
  color: white;
}

.auto-fix-btn:hover {
  background: #229954;
}

.cancel-btn {
  background: #95a5a6;
  color: white;
}

.cancel-btn:hover {
  background: #7f8c8d;
}

.auto-fix-btn svg {
  width: 18px;
  height: 18px;
}

/* Responsive */
@media (max-width: 768px) {
  .stock-modal {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }
  
  .stock-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .item-image, .item-placeholder {
    margin-right: 0;
  }
  
  .item-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .stock-actions {
    flex-direction: column;
  }
}
</style>
