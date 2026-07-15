import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";


const ApiFormData = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        "Content-type": "multipart/form-data",
    },
});


const Api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        "Content-type": "application/json",
    }
});

const getConfig = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
        headers: {
            'authorization': `Bearer ${token}`
        }
    };
};

// ============= USER APIs =============
export const createUserApi = (data) => ApiFormData.post("/api/user/register", data);
export const login = (data) => Api.post("/api/user/login", data);
export const forgotPasswordApi = (data) => Api.post("/api/user/forgot-password", data);
export const resetPasswordApi = (token, data) => Api.post(`/api/user/reset-password/${token}`, data);

// ============= BMI APIs =============
export const addBMI = (data) => Api.post("/api/user/bmi", data, getConfig());
export const getBMI = () => Api.get("/api/user/bmi", getConfig());
export const updateBMIInDB = (id, data) => Api.put(`/api/user/bmi/${id}`, data, getConfig());
export const deleteBMI = (id) => Api.delete(`/api/user/bmi/${id}`, getConfig());

// ============= MEAL APIs =============
export const addMeal = (data) => Api.post("/api/user/meals", data, getConfig());
export const getMeals = () => Api.get("/api/user/meals", getConfig());
export const updateMealInDB = (id, data) => Api.put(`/api/user/meals/${id}`, data, getConfig());
export const deleteMeal = (id) => Api.delete(`/api/user/meals/${id}`, getConfig());

// ============= WORKOUT APIs =============
export const saveWorkoutToDB = (data) => Api.post("/api/user/workouts/save", data, getConfig());
export const getWorkoutsFromDB = (userId) => Api.get(`/api/user/workouts/${userId}`, getConfig());

// ============= PROFILE APIs =============
export const updateProfileInDB = (data) => Api.put("/api/user/profile", data, getConfig());
export const updatePasswordInDB = (data) => Api.put("/api/user/password", data, getConfig());

// ============= TRAINER APIs =============
export const getTrainerClientsFromDB = () => Api.get("/api/user/trainer/clients", getConfig());
export const getClientHistoryFromDB = (clientId) => Api.get(`/api/user/trainer/client/${clientId}/history`, getConfig());

// ============= BADGE APIs =============
export const awardBadgeToClient = (data) => Api.post("/api/user/trainer/award-badge", data, getConfig());
export const getMyBadgesFromDB = () => Api.get("/api/user/my-badges", getConfig());