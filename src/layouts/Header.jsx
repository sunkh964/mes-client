import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "../images/logo.png";

export default function Header() {
  const navigate = useNavigate();
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  // 모니터링 on/off
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
      navigate('/main/process-management');
    } else {
      // ON 클릭 시 /monitoring 이동
      setIsMonitoring(true);
      navigate('/main/dashboard');
    }
  };

  return (
    <div>
      {/* 헤더 */}
      <div className="bg-[#c4c9cf] border-b border-gray-500 px-7 py-1 flex justify-between">
        {/* 회사 로고/메인으로 이동 */}
        <div className="flex items-center"
              onClick={() => navigate('/main')}>
          <img src={logo} alt="로고" className="mx-auto flex items-center p-1"
                style={{height:"70px"}} />
          <div className="text-xl font-bold text-blue-900 cursor-pointer px-2">
            (주)스팩중공업
          </div>
        </div>

        {/* 토글 스위치 우측 배치 */}
          <div className="cursor-pointer flex items-center gap-2" onClick={handleToggle}>
              <div className="text-sm font-bold text-gray-700">현황 및 모니터링</div>
              <div className={`w-16 h-7 flex items-center rounded-full p-1 duration-300 ease-in-out
                  ${isMonitoring ? 'bg-green-500 justify-end' : 'bg-gray-400 justify-start'}`}>
                  <div className="w-7 h-5 bg-white rounded-full shadow-md flex items-center justify-center text-xs font-bold">
                  {isMonitoring ? 'ON' : 'OFF'}
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
}
