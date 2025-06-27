import api from './api';

export default {
  getUsers() {
    return api.get('/users');
  },

  updateUser(id, userData) {
    return api.put(`/users/${id}`, userData);
  },

  deleteUser(id) {
    return api.delete(`/users/${id}`);
  }
};
