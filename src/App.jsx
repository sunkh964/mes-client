import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./pages/Layout";
import Login from "./pages/Login";
import { useEffect, useState } from "react";
import { getToken, removeToken } from './utils/api';

// 페이지 컴포넌트 import
import Dashboard from './pages/Dashboard';
import ProcessManagement from "./pages/ProcessManagement";
import WorkcenterManagement from "./pages/WorkcenterManagement";
import EquipmentManagement from './pages/EquipmentManagement';
import WorkerManagement from './pages/WorkerManagement';
import ProcessPlanInquiry from "./pages/ProcessPlanManagement";
import WorkOrderInquiry from "./pages/WorkOrderInquiry";
import WorkResultLogging from './pages/WorkResultLogging';
import MaterialInput from './pages/MaterialInput';
import MaterialOutput from './pages/MaterialOutput';
import MaterialInventory from './pages/MaterialInventory';
import QualityControl from './pages/QualityControl';
import DefectReport from './pages/DefectReport';
import ShipmentManagement from './pages/ShipmentManagement';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState(null);

  // 로그인 상태 관리 로직 (기존 코드를 그대로 사용합니다)
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
      removeToken();
    }
  }, []);

  const handleLogin = () => {
    const storedEmployeeId = localStorage.getItem('employeeId');
    const storedRole = localStorage.getItem('role');
    setIsLoggedIn(true);
    setUsername(storedEmployeeId);
    setRole(storedRole);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername(null);
    setRole(null);
    removeToken();
  };

  return (
    <Routes>
      {/* 로그인 페이지 라우트 */}
      <Route 
        path="/login" 
        element={isLoggedIn ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} 
      />

      {/* Layout을 사용하는 모든 페이지: 로그인 상태가 아니면 로그인 페이지로 리다이렉트 */}
      <Route 
        path="/" 
        element={isLoggedIn ? <Layout role={role} onLogout={handleLogout} username={username} /> : <Navigate to="/login" replace />}
      >
        
        {/* '/' 경로일 때 기본으로 보여줄 페이지 */}
        <Route index element={<Dashboard />} />
        
        {/* 기준 정보 관리 */}
        <Route path="master-data">
          <Route path="processes" element={<ProcessManagement />} />
          <Route path="work-centers" element={<WorkcenterManagement />} />
          <Route path="equipment" element={<EquipmentManagement />} />
          <Route path="workers" element={<WorkerManagement />} />
        </Route>
        
        {/* 생산 관리 */}
        <Route path="production">
          <Route path="plans" element={<ProcessPlanInquiry />} />
          <Route path="orders" element={<WorkOrderInquiry />} />
        </Route>
        
        {/* 공정 관리 */}
        <Route path="shop-floor">
          <Route path="start-stop" element={<WorkOrderInquiry />} />
          <Route path="results-log" element={<WorkResultLogging />} />
        </Route>
        
        {/* 자재 관리 */}
        <Route path="materials">
          <Route path="input" element={<MaterialInput />} />
          <Route path="output" element={<MaterialOutput />} />
          <Route path="inventory" element={<MaterialInventory />} />
        </Route>

        {/* 품질 관리 */}
        <Route path="quality">
          <Route path="inspection" element={<QualityControl />} />
          <Route path="defects" element={<DefectReport />} />
        </Route>

        {/* 출하 관리 */}
        <Route path="shipping">
            <Route path="shipments" element={<ShipmentManagement />} />
        </Route>
      </Route>

      {/* 정의되지 않은 모든 경로는 로그인 페이지로 이동 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}