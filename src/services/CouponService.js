import axios from 'axios';

const API_URL = 'http://localhost:3000/coupons';

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
  createCoupon(couponData) {
    return axios.post(API_URL, couponData, { headers: getAuthHeaders() });
  },

  getAllCoupons() {
    return axios.get(API_URL, { headers: getAuthHeaders() });
  },

  getCouponByCode(code) {
    return axios.get(`${API_URL}/code/${code}`);
  },

  updateCoupon(id, couponData) {
    return axios.put(`${API_URL}/${id}`, couponData, { headers: getAuthHeaders() });
  },

  deleteCoupon(id) {
    return axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() });
  },
};
