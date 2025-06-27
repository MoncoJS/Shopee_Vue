<template>
    <div class="profile-bg">
        <div class="profile-container">
            <h2 class="profile-title">โปรไฟล์ของฉัน</h2>
            <div v-if="loading" class="profile-loading">กำลังโหลดข้อมูล...</div>
            <ProfileInfo v-else :user="user" @update-profile="onUpdateProfile" />
            <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        </div>
    </div>
</template>

<script>
import "@/styles/profile.css"
import ProfileInfo from '../components/ProfileInfo.vue'
export default {
    name: "ProfileView",
    components: { ProfileInfo },
    data() {
        return {
            user: {},
            loading: true,
            errorMessage: ""
        }
    },
    async created() {
        await this.fetchUser()
    },
    methods: {
        async fetchUser() {
            this.loading = true
            try {
                const token = localStorage.getItem("token");
                let userId = localStorage.getItem("userId");
                // console.log("Token from localStorage:", token);
                // console.log("UserId from localStorage:", userId);

                // If userId is not in localStorage, try to extract from token
                if (!userId && token) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        userId = payload._id;
                        if (userId) {
                            localStorage.setItem("userId", userId);
                            // console.log("Extracted userId from token:", userId);
                        }
                    } catch (err) {
                        // console.error("Failed to decode token:", err);
                    }
                }

                if (!userId) {
                    this.errorMessage = "ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่";
                    this.loading = false;
                    return;
                }

                const res = await fetch(`http://localhost:3000/users/${userId}`, {
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                });
                // console.log("API response status:", res.status); // Debug: log status
                if (!res.ok) {
                    await res.text();
                    // console.error("API error response:", errorText); // Debug: log error response
                    throw new Error("ไม่สามารถโหลดข้อมูลผู้ใช้");
                }
                const data = await res.json();
                // console.log("API response data:", data); // Debug: log data
                if (data.success) {
                    this.user = data.data;
                } else {
                    this.errorMessage = data.message || "เกิดข้อผิดพลาด";
                }
            } catch (e) {
                this.errorMessage = "เกิดข้อผิดพลาดในการโหลดข้อมูล";
                // console.error(e); // Debug: log error
            } finally {
                this.loading = false;
            }
        },
        async onUpdateProfile(newProfile) {
            this.loading = true
            this.errorMessage = ""
            try {
                const token = localStorage.getItem("token");
                let userId = localStorage.getItem("userId");
                if (!userId && token) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        userId = payload._id;
                    } catch (err) {
                        // do nothing
                    }
                }
                if (!userId) {
                    this.errorMessage = "ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่";
                    this.loading = false;
                    return;
                }
                const res = await fetch(`http://localhost:3000/users/${userId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + token
                    },
                    body: JSON.stringify(newProfile)
                });
                if (!res.ok) {
                    const errText = await res.text()
                    throw new Error(errText || "ไม่สามารถอัปเดตข้อมูลผู้ใช้");
                }
                const data = await res.json();
                if (data.success) {
                    this.user = data.data;
                } else {
                    this.errorMessage = data.message || "เกิดข้อผิดพลาดขณะอัปเดต";
                }
            } catch (e) {
                this.errorMessage = "เกิดข้อผิดพลาดขณะอัปเดตโปรไฟล์";
            } finally {
                this.loading = false;
                await this.fetchUser()
            }
        }
    }
}
</script>
