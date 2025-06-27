import axios from 'axios';

const API_URL = 'http://localhost:3000/users';

const getToken = () => {
  return localStorage.getItem('token');
};

const getAuthHeaders = () => {
  const token = getToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

export default {
  getUsers() {
    return axios.get(API_URL, { headers: getAuthHeaders() });
  },

  updateUser(id, userData) {
    return axios.put(`${API_URL}/${id}`, userData, { headers: getAuthHeaders() });
  },

  deleteUser(id) {
    return axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() });
  }
};
