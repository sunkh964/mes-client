import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Header() {
  const navigate = useNavigate();
  const [isMonitoring, setIsMonitoring] = useState(false);

  // 초기 렌더 시 현재 경로에 따라 상태 세팅
  useEffect(() => {
    if (window.location.pathname === "/monitoring") {
      setIsMonitoring(true);
    } else {
      setIsMonitoring(false);
    }
  }, []);

  const handleToggle = () => {
    if (isMonitoring) {
      // OFF 클릭 시 /main 이동
      setIsMonitoring(false);
      navigate('/main');
    } else {
      // ON 클릭 시 /monitoring 이동
      setIsMonitoring(true);
      navigate('/monitoring');
    }
  };

  return (
    <div>
      {/* 헤더 */}
      <div className="bg-[#c4c9cf] border-b border-gray-500 p-4 flex justify-between items-center">
        {/* 토글 스위치 좌측 배치 */}
        <div className="cursor-pointer flex items-center gap-2" onClick={handleToggle}>
            <div className="text-sm font-bold text-gray-700">현황 및 모니터링</div>
            <div className={`w-16 h-7 flex items-center rounded-full p-1 duration-300 ease-in-out
                ${isMonitoring ? 'bg-green-500 justify-end' : 'bg-gray-400 justify-start'}`}>
                <div className="w-7 h-5 bg-white rounded-full shadow-md flex items-center justify-center text-xs font-bold">
                {isMonitoring ? 'ON' : 'OFF'}
                </div>
            </div>
        </div>

        {/* 회사 로고/메인으로 이동 */}
        <div
          className="text-xl font-bold text-blue-900 cursor-pointer"
          onClick={() => navigate('/main')}
        >
          (주)스팩중공업
        </div>

        {/* 로그인, 우측 끝 */}
        <div className="text-sm text-gray-600">로그인 버튼 등</div>
      </div>
    </div>
  );
}
