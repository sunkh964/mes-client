import axios from "axios";

export const API_BASE = "http://localhost:8082/api/v1";

export const getToken = () => localStorage.getItem("token");
// 로컬 스토리지에 토큰 저장
export const setToken = (token) => localStorage.setItem("token", token);
// 로컬 스토리지에서 토큰 삭제
export const removeToken = () => localStorage.removeItem("token");


// axios 전역 기본 URL 세팅
axios.defaults.baseURL = API_BASE;

// axios 전역 요청 인터셉터: 모든 요청에 자동으로 토큰 넣기
axios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);