import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ isAllowed, redirectPath = "/login", children }) {
  const location = useLocation();

  if (!isAllowed) {
    // 권한 없으면 로그인 페이지로 리다이렉트, 이전 경로 정보도 전달
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  return children;
}
