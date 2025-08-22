import { Route, Routes, useNavigate } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import Standard from './pages/Standard';
import Test from './pages/Test';
import Standard2 from './pages/Standard2';

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
      <div className="flex flex-1">
        {/* 좌측 메뉴영역 */}
        <div className="w-64 bg-gray-100 border border-gray-400 p-4">
          <UserLayout />
        </div>

        {/* 우측 라우팅된 콘텐츠영역 */}
        <div className="flex-1 bg-white border border-green-400 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Test />}>
              <Route path="standard" element={<Standard />} />
              <Route path="standard2" element={<Standard2 />} />
            </Route>
            <Route>

            </Route>
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
