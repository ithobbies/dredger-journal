import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000/api",
    // headers: {
    //     "Content-Type": "application/json",
    // },
    withCredentials: true
});

// Добавляем заголовок Authorization со свежим токеном для каждого запроса
api.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem("access");
    if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

export default api;
