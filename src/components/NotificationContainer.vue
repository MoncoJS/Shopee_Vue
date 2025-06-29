<template>
  <div class="notification-container">
    <NotificationToast
      v-for="notification in $notify.notifications"
      :key="notification.id"
      :message="notification.message"
      :type="notification.type"
      :duration="0"
      :show="notification.show"
      @close="$notify.remove(notification.id)"
    />
  </div>
</template>

<script>
import NotificationToast from './NotificationToast.vue'

export default {
  name: 'NotificationContainer',
  components: {
    NotificationToast
  }
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 80px; /* Below navbar */
  right: 20px;
  z-index: 9999;
  pointer-events: none;
  max-width: 400px;
  width: 100%;
}

.notification-container > * {
  pointer-events: auto;
  margin-bottom: 12px;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .notification-container {
    top: 70px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
</style>
