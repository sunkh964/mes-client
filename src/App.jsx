import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./pages/Layout";
import Login from "./pages/Login";
import Dashboard from './pages/Dashboard';

// 모든 페이지 컴포넌트들을 import 합니다.
import WorkcenterManagement from "./pages/WorkcenterManagement";
import ProcessManagement from "./pages/ProcessManagement";
import EquipmentManagement from './pages/EquipmentManagement';
import ProcessPlanInquiry from "./pages/ProcessPlanManagement";
import WorkOrderInquiry from "./pages/WorkOrderInquiry";
import WorkResultLogging from './pages/WorkResultLogging';
import MaterialInput from './pages/MaterialInput';
import MaterialOutput from './pages/MaterialOutput';
import MaterialInventory from './pages/MaterialInventory';
import QualityControl from './pages/QualityControl';
import DefectReport from './pages/DefectReport';

export default function App() {
  return (
    // 이 App 컴포넌트는 main.jsx에서 <BrowserRouter>로 감싸져 있어야 합니다.
    <Routes>
      {/* 로그인 페이지는 Layout과 별개로 작동합니다. */}
      <Route path="/login" element={<Login />} />

      {/* Layout(헤더, 사이드바)을 사용하는 모든 페이지들의 부모 라우트 */}
      <Route path="/" element={<Layout />}>
        
        {/* '/' 경로로 접속했을 때 보여줄 기본 페이지 */}
        <Route index element={<Dashboard />} />
        
        {/* 기준 정보 관리 */}
        <Route path="master-data/work-centers" element={<WorkcenterManagement />} />
        <Route path="master-data/processes" element={<ProcessManagement />} />
        <Route path="master-data/equipment" element={<EquipmentManagement />} />

        {/* 생산 관리 */}
        <Route path="production/plans" element={<ProcessPlanInquiry />} />
        <Route path="production/orders" element={<WorkOrderInquiry />} />

        {/* 공정 관리 */}
        <Route path="shop-floor/start-stop" element={<WorkOrderInquiry />} />
        <Route path="shop-floor/results-log" element={<WorkResultLogging />} />

        {/* 자재 관리 */}
        <Route path="materials/input" element={<MaterialInput />} />
        <Route path="materials/output" element={<MaterialOutput />} />
        <Route path="materials/inventory" element={<MaterialInventory />} />

        {/* 품질 관리 */}
        <Route path="quality/inspection" element={<QualityControl />} />
        <Route path="quality/defects" element={<DefectReport />} />

        {/* 장비 관리 */}
        <Route path="equipment" element={<EquipmentManagement />} />

      </Route>

      {/* 위에 정의되지 않은 모든 경로는 로그인 페이지로 이동시킵니다. */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}