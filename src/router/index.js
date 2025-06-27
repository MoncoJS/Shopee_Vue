import Vue from "vue";
import VueRouter from "vue-router";
import LoginView from "../views/LoginView.vue";
import ProductsView from "../views/ProductsView.vue";
import CartView from "../views/CartView.vue";
import RegisterView from "../views/RegisterView.vue";
import AddProductView from "../views/AddProductView.vue";
import ProfileView from "../views/ProfileView.vue";
import EditProductView from "../views/EditProductView.vue";
import UserManagement from "../components/UserManagement.vue";
import CouponManagement from "../views/CouponManagement.vue";
Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: "/products"
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
  },
  {
    path: "/register",
    name: "register",
    component: RegisterView,
  },
  {
    path: "/profile",
    name: "ProfileView",
    component: ProfileView,
  },
  {
    path: "/products",
    name: "products",
    component: ProductsView,
  },
  {
    path: "/add_products",
    name: "add_products",
    component: AddProductView,
  },
  {
    path: "/edit_product/:id",
    name: "edit_product",
    component: EditProductView,
    props: true // Pass route params as props to component
  },
  {
    path: "/cart",
    name: "cart",
    component: CartView,
  },
  {
    path: "/manage_users",
    name: "manage_users",
    component: UserManagement,
  },

  {
    path: "/coupons",
    name: "coupons",
    component: CouponManagement,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
];
const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  let isAuthenticated = !!token;
  let isAdmin = false;

  if (isAuthenticated) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("Token payload:", payload);
      if (payload.role === "admin") {
        isAdmin = true;
      }
    } catch (e) {
      console.error("Error decoding token or token invalid:", e);
      isAuthenticated = false; // Invalidate token if decoding fails
      localStorage.removeItem("token");
    }
  }

  console.log("Navigating to:", to.path, "Requires Admin:", to.matched.some(record => record.meta.requiresAdmin), "Is Admin:", isAdmin);

  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next({ name: "login" });
  } else if (to.matched.some(record => record.meta.requiresAdmin) && !isAdmin) {
    next({ path: "/" }); // Redirect to home if not admin
  } else {
    next();
  }
});

export default router;
