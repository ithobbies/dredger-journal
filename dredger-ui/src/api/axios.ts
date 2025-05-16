import axios from "axios";
import jwtDecode from "jwt-decode";

const api = axios.create({ baseURL: "http://localhost:8000/api" });
let access = localStorage.getItem("access");
let refresh = localStorage.getItem("refresh");

api.interceptors.request.use((cfg) => {
  if (access) cfg.headers.Authorization = `Bearer ${access}`;
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && refresh) {
      const { exp } = jwtDecode<{ exp: number }>(refresh);
      if (Date.now() / 1000 < exp) {
        const resp = await axios.post(
          "http://localhost:8000/api/auth/refresh/",
          { refresh }
        );
        access = resp.data.access;
        localStorage.setItem("access", access!);
        error.config.headers.Authorization = `Bearer ${access}`;
        return axios(error.config);
      }
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
