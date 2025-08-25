import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./pages/Layout"; // 레이아웃 컴포넌트
import Test from "./pages/Test";
import Standard2 from "./pages/Standard2";
import WorkcenterManagement from "./pages/WorkcenterManagement";
import ProcessManagement from "./pages/ProcessManagement";
import ProcessPlanManagement from "./pages/ProcessPlanManagement"; 
import WorkOderManagement from "./pages/WorkOderManagement";
import Login from "./pages/Login"; // 로그인은 기본 페이지
import Monitoring from "./pages/Monitoring";

export default function App() {
  return (
    <Routes>
      {/* 기본 경로 로그인으로 */}
      <Route path="/" element={<Login />} />

      {/* 나머지 경로들 (Layout 하위 최상위 경로) */}

      {/* 모니터링 페이지 독립 경로 */}
      <Route path="/monitoring" element={<Layout />}>
        <Route path="" element={<Monitoring />} />
      </Route>

      {/* 공정정보관리 */}
      <Route path="/main" element={<Layout />}>
        <Route path="" element={<ProcessManagement />} />
        <Route path="workcenter-management" element={<WorkcenterManagement />} />
        <Route path="processplan-management" element={<ProcessPlanManagement />} />
        <Route path="workorder-management" element={<WorkOderManagement />} />
      </Route>

      {/* 생산관리 */}
      <Route path="/produce" element={<Layout />}>
        <Route path="" element={<Test />} />
        <Route path="standard2" element={<Standard2 />} />
      </Route>



      {/* 잘못된 경로 처리 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
