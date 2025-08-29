import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ isAllowed, redirectPath = '/login', children }) {
  if (!isAllowed) {
    // 허용되지 않으면 지정된 경로(기본 /login)로 리다이렉트
    return <Navigate to={redirectPath} replace />;
  }

  // 허용되면 자식 컴포넌트를 렌더링
  return children;
}
