import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./pages/Layout";
import Login from "./pages/Login";
import Dashboard from './pages/Dashboard'; // ✨ 누락되었던 Dashboard import 추가

// 페이지 컴포넌트 import
import ProcessManagement from "./pages/ProcessManagement";
import WorkcenterManagement from "./pages/WorkcenterManagement";
import ProcessPlanInquiry from "./pages/ProcessPlanManagement";
import WorkOrderInquiry from "./pages/WorkOrderInquiry";
import MaterialInput from './pages/MaterialInput';
import MaterialOutput from './pages/MaterialOutput';
import MaterialInventory from './pages/MaterialInventory';
import WorkResultLogging from './pages/WorkResultLogging';

export default function App() {
  return (
    
      <Routes>
        {/* 로그인 페이지는 Layout과 분리 */}
        <Route path="/login" element={<Login />} />

        {/* Layout(헤더, 사이드바)을 사용하는 모든 페이지들의 부모 라우트 */}
        <Route path="/" element={<Layout />}>
          
          {/* 웹사이트의 첫 페이지('/')일 때 기본으로 보여줄 페이지 */}
          <Route index element={<Dashboard />} /> 
          
          {/* 기준 정보 관리 */}
          <Route path="main/dashboard" element={<Dashboard />} />
          <Route path="main/process-management" element={<ProcessManagement />} />
          <Route path="main/workcenter-management" element={<WorkcenterManagement />} />
          
          {/* 생산 관리 */}
          <Route path="produce/processplan-management" element={<ProcessPlanInquiry />} />
          <Route path="produce/workorder-management" element={<WorkOrderInquiry />} />

          {/* 공정 관리 */}
          <Route path="process/work-orders" element={<WorkOrderInquiry />} />
          <Route path="process/work-results-log" element={<WorkResultLogging />} />

          {/* 자재 관리 */}
          <Route path="material/material-input" element={<MaterialInput />} />
          <Route path="material/material-output" element={<MaterialOutput />} />
          <Route path="material/material-inventory" element={<MaterialInventory />} />

        </Route>

        {/* 정의되지 않은 모든 경로는 로그인 페이지로 이동 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    
  );
}