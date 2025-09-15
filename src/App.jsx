// App.jsx
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Layout from "./pages/Layout";
import Login from "./pages/Login";
import ProtectedRoute from './components/ProtectedRoute';

// 페이지 컴포넌트 import
import Dashboard from './pages/Dashboard';
import ProcessManagement from "./pages/ProcessManagement";
import WorkcenterManagement from "./pages/WorkcenterManagement";
import EquipmentManagement from './pages/EquipmentManagement';
import ProcessPlanInquiry from "./pages/ProcessPlanManagement";
import WorkOrderInquiry from "./pages/WorkOrderInquiry";
import MaterialInput from './pages/MaterialInput';
import MaterialOutput from './pages/MaterialOutput';
import MaterialInventory from './pages/MaterialInventory';
import QualityControl from './pages/QualityControl';
import DefectReport from './pages/DefectReport';
import WorkResultLogging from './pages/WorkResultLogging';
import { useEffect, useState } from "react";
import { getToken, removeToken } from './utils/api';
import { decodeJwt} from './utils/decodeJwt';
import BlockPlan from "./pages/BlockPlan";
import WorkOrder from "./pages/WorkOrder";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState(null);

  // 컴포넌트 마운트 시 토큰 유효성 검사 및 상태 업데이트
  // 이 로직은 페이지를 새로고침하거나 직접 접속했을 때 로그인 상태를 유지하기 위해 필수적입니다.
  useEffect(() => {
    const token = getToken();
    const storedEmployeeId = localStorage.getItem('employeeId');
    const storedRole = localStorage.getItem('role');

    if (token && storedEmployeeId && storedRole) {
      setIsLoggedIn(true);
      setUsername(storedEmployeeId);
      setRole(storedRole);
    } else {
      setIsLoggedIn(false);
      setUsername(null);
      setRole(null);
      removeToken(); // 토큰이 유효하지 않으면 제거
    }
  }, []);

  // 로그인 처리 함수: Login 컴포넌트로부터 호출됨
  // Login 컴포넌트에서 이미 로컬 스토리지에 값을 저장하므로, App에서는 상태만 업데이트합니다.
  const handleLogin = () => {
    const storedEmployeeId = localStorage.getItem('employeeId');
    const storedRole = localStorage.getItem('role');
    setIsLoggedIn(true);
    setUsername(storedEmployeeId);
    setRole(storedRole);
  };

  // 로그아웃 처리 함수: UserLayout으로부터 호출됨
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername(null);
    setRole(null);
    removeToken(); // 토큰 삭제
  };

  return (
    <Routes>
      {/* 로그인 페이지는 Layout과 분리 */}
      <Route path="/login" element={isLoggedIn ? <Navigate to="/main/processes" replace /> 
                                                : <Login onLogin={handleLogin} />} />

      {/* Layout을 사용하는 모든 페이지: 로그인 상태가 아니면 로그인 페이지로 리다이렉트 */}
      <Route path="/" element={isLoggedIn 
                               ? <Layout role={role} onLogout={handleLogout} username={username} /> 
                               : <Navigate to="/login" replace />}>
        
        {/* 웹사이트의 첫 페이지('/')일 때 기본으로 보여줄 페이지 */}
        <Route index element={<ProcessManagement />} />
        
        {/* 기준 정보 관리 */}
        <Route path="main">
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="processes" element={<ProcessManagement />} />
          <Route path="work-centers" element={<WorkcenterManagement />} />
          <Route path="equipments" element={<EquipmentManagement />} /> {/* 삭제해야할듯 */}
        </Route>
        
        {/* 생산 관리 */}
        <Route path="produce">
          <Route path="plans" element={<ProcessPlanInquiry />} />
          <Route path="blockPlans" element={<BlockPlan/>} />
          <Route path="workOrders" element={<WorkOrder />} /> 
          <Route path="workorder-management" element={<WorkOrderInquiry />} /> {/* 삭제해야할듯 */}
        </Route>
        
        {/* 작업지시 관리 */}
        <Route path="process">
          
          <Route path="results-log" element={<WorkResultLogging />} /> {/* 삭제해야할듯 */}
        </Route>
        
        {/* 자재 관리 */}
        <Route path="materials">
          <Route path="input" element={<MaterialInput />} />
          <Route path="output" element={<MaterialOutput />} /> {/* 삭제해야할듯 */}
          <Route path="inventory" element={<MaterialInventory />} /> {/* 삭제해야할듯 */}
        </Route>

        {/* 품질 관리 */}
        <Route path="quality">
          <Route path="inspection" element={<QualityControl />} />
          <Route path="defects" element={<DefectReport />} />
        </Route>

        {/* 설비 관리 - 삭제해야함  */}
        <Route path="equipment">
          <Route path="equipment-management" element={<EquipmentManagement />} />
        </Route>

      </Route>

      {/* 정의되지 않은 모든 경로는 로그인 페이지로 이동 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}