import { Route, Routes, useNavigate } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
// import Standard from './pages/ProcessManagement.jsx';
import Test from './pages/Test';
import Standard2 from './pages/Standard2';
import WorkcenterManagement from './pages/WorkcenterManagement.jsx';
import ProcessManagement from './pages/ProcessManagement.jsx';
import ProcessPlanManagement from './pages/ProcessPlanManagement.jsx';
import WorkOderManagement from './pages/WorkOderManagement.jsx';
import MaterialInput from './pages/MaterialInput.jsx';
import MaterialOutput from './pages/MaterialOutput.jsx';
import MaterialInventory from './pages/MaterialInventory.jsx';
import WorkResultLogging from './pages/WorkResultLogging.jsx';
import WorkOrderInquiry from './pages/WorkOrderInquiry.jsx';
import Dashboard from './pages/Dashboard.jsx';

function App() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col">
      {/* 헤더 */}
      <div className="bg-blue-200 border border-blue-500 p-4 flex justify-between items-center">
        <div className="text-sm text-gray-700">상단 우측으로 가야함...</div>
        <div
          className="text-xl font-bold text-blue-900 cursor-pointer"
          onClick={() => navigate('/')}
        >
          (주)스팩중공업
        </div>
        <div className="text-sm text-gray-600">로그인 버튼 등</div>
      </div>

      {/* 본문 영역 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 좌측 메뉴영역 */}
        <div className="w-64 bg-gray-100 border border-gray-400 p-4 overflow-y-auto">
          <UserLayout />
        </div>

        {/* 우측 라우팅된 콘텐츠영역 */}
        <div className="flex-1 bg-white border border-green-400 p-6 overflow-y-auto">
          <Routes>
            {/* 각 경로에 해당하는 페이지만 보여주도록 규칙을 수정합니다. */}
            <Route path="/" element={<Test />} />
            {/* <Route path="/standard" element={<Standard />} /> */}
            <Route path="/standard2" element={<Standard2 />} />
            <Route path="/workcenter-management" element={<WorkcenterManagement />} />
            <Route path="/process-management" element={<ProcessManagement />} />
            <Route path="/processplan-management" element={<ProcessPlanManagement />} />
            <Route path="/workorder-management" element={<WorkOderManagement />} />
            <Route path="/material-input" element={<MaterialInput />} />
            <Route path="/material-output" element={<MaterialOutput />} />
            <Route path="/material-inventory" element={<MaterialInventory />} />
            <Route path="/work-results-log" element={<WorkResultLogging />} />
            <Route path="/work-orders" element={<WorkOrderInquiry />} />
            <Route path="/dashboard" element={<Dashboard />} /> 
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;