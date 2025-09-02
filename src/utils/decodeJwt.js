

export const decodeJwt = (token) => {
  try {
    const payload = token.split('.')[1]; 
    // Base64로 인코딩된 페이로드를 디코딩, JSON 문자열을 객체로 변환
    const decoded = JSON.parse(atob(payload));

    return decoded;
  } catch (e) {
    console.error("Failed to decode JWT:", e);
    return null;
  }
};