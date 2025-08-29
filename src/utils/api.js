
export const API_BASE = "http://localhost:8080/api/v1";

export const getToken = () => localStorage.getItem("token");

// 로컬 스토리지에 토큰 저장
export const setToken = (token) => localStorage.setItem("token", token);

// 로컬 스토리지에서 토큰 삭제
export const removeToken = () => localStorage.removeItem("token");