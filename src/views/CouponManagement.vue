<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Coupon Management</h1>

    <!-- Coupon Creation Form -->
    <div class="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Create New Coupon</h2>
      <form @submit.prevent="createCoupon">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label for="couponName" class="block text-sm font-medium text-gray-700">Coupon Name</label>
            <input type="text" id="couponName" v-model="newCoupon.name" class="mt-1 block w-full input input-bordered" required>
          </div>
          <div>
            <label for="couponCode" class="block text-sm font-medium text-gray-700">Coupon Code (Leave blank to auto-generate)</label>
            <input type="text" id="couponCode" v-model="newCoupon.code" class="mt-1 block w-full input input-bordered">
          </div>
          <div>
            <label for="discountType" class="block text-sm font-medium text-gray-700">Discount Type</label>
            <select id="discountType" v-model="newCoupon.discountType" class="mt-1 block w-full select select-bordered" required>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
          <div>
            <label for="discountValue" class="block text-sm font-medium text-gray-700">Discount Value</label>
            <input type="number" id="discountValue" v-model.number="newCoupon.discountValue" class="mt-1 block w-full input input-bordered" min="0" required>
          </div>
          <div>
            <label for="expirationDate" class="block text-sm font-medium text-gray-700">Expiration Date</label>
            <input type="date" id="expirationDate" v-model="newCoupon.expirationDate" class="mt-1 block w-full input input-bordered" required>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="isActive" v-model="newCoupon.isActive" class="checkbox checkbox-primary">
            <label for="isActive" class="ml-2 text-sm font-medium text-gray-700">Is Active</label>
          </div>
        </div>
        <button type="submit" class="btn btn-primary">Create Coupon</button>
      </form>
    </div>

    <!-- Coupon List -->
    <div class="bg-white shadow-md rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-4">Existing Coupons</h2>
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Type</th>
              <th>Value</th>
              <th>Expires</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="coupon in coupons" :key="coupon._id">
              <td>{{ coupon.name }}</td>
              <td>{{ coupon.code }}</td>
              <td>{{ coupon.discountType }}</td>
              <td>{{ coupon.discountValue }}</td>
              <td>{{ new Date(coupon.expirationDate).toLocaleDateString() }}</td>
              <td>
                <input type="checkbox" v-model="coupon.isActive" @change="toggleCouponStatus(coupon)" class="checkbox checkbox-primary">
              </td>
              <td>
                <button @click="editCoupon(coupon)" class="btn btn-sm btn-outline btn-info mr-2">Edit</button>
                <button @click="deleteCoupon(coupon._id)" class="btn btn-sm btn-outline btn-error">Delete</button>
              </td>
            </tr>
            <tr v-if="coupons.length === 0">
              <td colspan="7" class="text-center">No coupons found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'CouponManagement',
  data() {
    return {
      newCoupon: {
        name: '',
        code: '',
        discountType: 'percentage',
        discountValue: 0,
        expirationDate: '',
        isActive: true,
      },
      coupons: [],
    };
  },
  methods: {
    async fetchCoupons() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/coupons', {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.coupons = response.data.data;
      } catch (error) {
        // console.error('Error fetching coupons:', error);
        alert('Failed to fetch coupons.');
      }
    },
    async createCoupon() {
      try {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:3000/coupons', this.newCoupon, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Coupon created successfully!');
        this.newCoupon = {
          name: '',
          code: '',
          discountType: 'percentage',
          discountValue: 0,
          expirationDate: '',
          isActive: true,
        };
        this.fetchCoupons();
      } catch (error) {
        // console.error('Error creating coupon:', error);
        alert('Failed to create coupon.');
      }
    },
    async toggleCouponStatus(coupon) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:3000/coupons/${coupon._id}`, { isActive: coupon.isActive }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Coupon status updated.');
      } catch (error) {
        // console.error('Error updating coupon status:', error);
        alert('Failed to update coupon status.');
        coupon.isActive = !coupon.isActive; // Revert on error
      }
    },
    editCoupon(coupon) {
      // Implement edit logic, perhaps open a modal or navigate to an edit page
      alert('Edit functionality not yet implemented for ' + coupon.name);
    },
    async deleteCoupon(id) {
      if (confirm('Are you sure you want to delete this coupon?')) {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`http://localhost:3000/coupons/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          alert('Coupon deleted successfully!');
          this.fetchCoupons();
        } catch (error) {
          // console.error('Error deleting coupon:', error);
          alert('Failed to delete coupon.');
        }
      }
    },
  },
  created() {
    this.fetchCoupons();
  },
};
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
