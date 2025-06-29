<template>
  <div id="app">
    <AppNavbar />
    <div class="main-content">
      <router-view />
    </div>
    <NotificationContainer />
  </div>
</template>

<style>
@import './styles/main.css';

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

/* เพิ่ม CSS สำหรับ z-0 */
.z-0 {
  z-index: 0;
  position: relative;
}
</style>

<script>
import AppNavbar from '@/components/Navbar.component.vue'
import NotificationContainer from '@/components/NotificationContainer.vue'

export default {
  name: 'HomeView',
  components: {
    AppNavbar,
    NotificationContainer
  }
}
</script>