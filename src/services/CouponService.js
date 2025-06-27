import api from './api';

export default {
  createCoupon(couponData) {
    return api.post('/coupons', couponData);
  },

  getAllCoupons() {
    return api.get('/coupons');
  },

  getCouponByCode(code) {
    return api.get(`/coupons/code/${code}`);
  },

  updateCoupon(id, couponData) {
    return api.put(`/coupons/${id}`, couponData);
  },

  deleteCoupon(id) {
    return api.delete(`/coupons/${id}`);
  },
};
