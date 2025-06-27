import Vue from 'vue'
import Vuex from 'vuex'
import api from '@/services/api' // Import the api instance

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null, // Will store user object { _id, username, role, etc. }
  },
  getters: {
    isLoggedIn: state => !!state.user,
    isAdmin: state => state.user && state.user.role === 'admin',
    getUser: state => state.user,
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
      // console.log('Vuex: User set to:', user); // Debug log
    },
    clearUser(state) {
      state.user = null;
      // console.log('Vuex: User cleared.'); // Debug log
    },
  },
  actions: {
    // Action to fetch user data and set it in the store
    async fetchUser({ commit }) {
      const token = localStorage.getItem("token");

      if (!token) {
        commit('clearUser');
        return;
      }

      try {
        // Decode token to get user ID
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload._id;

        if (!userId) {
          commit('clearUser');
          return;
        }

        const res = await api.get(`/users/${userId}`); // Use api instance

        if (res.data.success) {
          commit('setUser', res.data.data);
        } else {
          commit('clearUser');
        }
      } catch (error) {
        // console.error("Error fetching user:", error);
        commit('clearUser');
      }
    },
    logout({ commit }) {
      localStorage.removeItem("token");
      commit('clearUser');
    },
  },
  modules: {
  }
})
