import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import axios from "axios";
import VueAxios from "vue-axios";
import { NotificationPlugin } from "./services/notification";

Vue.use(VueAxios, axios);
Vue.use(NotificationPlugin);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
  created() {
    this.$store.dispatch('fetchUser'); // Fetch user data when app is created
  },
}).$mount("#app");

