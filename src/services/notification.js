import Vue from 'vue'

class NotificationService {
  constructor() {
    this.state = Vue.observable({
      notifications: []
    })
    this.nextId = 1
  }

  show(message, type = 'info', duration = 4000) {
    const notification = {
      id: this.nextId++,
      message,
      type,
      duration,
      show: true
    }

    this.state.notifications.push(notification)

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(notification.id)
      }, duration)
    }

    return notification.id
  }

  success(message, duration = 4000) {
    return this.show(message, 'success', duration)
  }

  error(message, duration = 6000) {
    return this.show(message, 'error', duration)
  }

  warning(message, duration = 5000) {
    return this.show(message, 'warning', duration)
  }

  info(message, duration = 4000) {
    return this.show(message, 'info', duration)
  }

  remove(id) {
    const index = this.state.notifications.findIndex(n => n.id === id)
    if (index > -1) {
      this.state.notifications.splice(index, 1)
    }
  }

  clear() {
    this.state.notifications.splice(0)
  }

  get notifications() {
    return this.state.notifications
  }
}

// Create singleton instance
const notificationService = new NotificationService()

// Vue plugin for easy access in components
export const NotificationPlugin = {
  install(Vue) {
    Vue.prototype.$notify = notificationService
  }
}

export default notificationService
