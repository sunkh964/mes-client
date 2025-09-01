import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import logo from "../images/logo.png";
import routesConfig from "../config/routeConfig";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const scrollContainerRef = useRef(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);

  useEffect(() => {
    if (window.location.pathname.startsWith("/main/dashboard")) {
      setIsMonitoring(true);
    } else {
      setIsMonitoring(false);
    }
  }, [location.pathname]);

  //화면 너비에 따른 크기 비교
  useEffect(() => {
    const checkOverflow = () => {
      if (scrollContainerRef.current) {
        // scrollWidth(내용의 총 너비)가 clientWidth(실제 보이는 너비)보다 크면 넘치는 것
        const isOverflowing = scrollContainerRef.current.scrollWidth > scrollContainerRef.current.clientWidth;
        setShowScrollButtons(isOverflowing);
      }
    };

    checkOverflow(); // 초기 렌더링 시 한 번 체크
    window.addEventListener('resize', checkOverflow); // 윈도우 크기 변경 시마다 체크

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('resize', checkOverflow);
    };
  }, []);

  const handleToggle = () => {
    if (isMonitoring) {
      setIsMonitoring(false);
      navigate('/main/process-management');
    } else {
      setIsMonitoring(true);
      navigate('/main/dashboard');
    }
  };

  const getActiveMenuTitle = () => {
    for (const route of routesConfig) {
      if (route.items.some((item) => location.pathname.startsWith(item.path) && item.path !== "/")) {
        return route.title;
      }
    }
    return "";
  };

  const activeTitle = getActiveMenuTitle();

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 150;
      if (direction === 'left') {
        scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <div>
      {/* 상단 섹션: 로고, 빠른 메뉴, 토글 스위치 */}
      <div className="bg-gray-200 border-b border-gray-300 px-7 py-1 flex items-center justify-between">
        
        {/* 좌측: 로고/회사명 */}
        <div className="flex-none flex items-center pr-4" onClick={() => navigate('/main')}>
          <img src={logo} alt="로고" className="mr-2 cursor-pointer" style={{ height: "50px" }} />
          <div className="text-lg font-bold text-gray-700 cursor-pointer"style={{ color: "#304c70ff" }}>
            (주)스팩중공업 MES
          </div>
        </div>

        {/* 중앙: 빠른 메뉴와 스크롤 버튼 컨테이너 */}
        <div className="px-2 flex items-center justify-around overflow-hidden">
          {/* 왼쪽 스크롤 버튼 */}
          {showScrollButtons && (
            <button
              onClick={() => handleScroll('left')}
              className="flex-none px-2 mr-2 text-gray-600 hover:text-[#2A5D9F] focus:outline-none"
              style={{ fontSize: '1.5rem'}}
            >
              {'<'}
            </button>
          )}
          
          {/* 스크롤 가능한 메뉴 목록 */}
          <div ref={scrollContainerRef} className="flex-grow flex overflow-x-auto space-x-1 whitespace-nowrap scrollbar-hide">
            {routesConfig.map((menu) => (
              <div
                key={menu.title}
                className={`
                  flex-none w-28 h-11 flex items-center justify-center text-xs font-semibold
                  border border-gray-300 cursor-pointer transition-colors duration-200
                  ${activeTitle === menu.title ? "bg-white text-gray-900 border-gray-400" : "bg-white text-gray-700 hover:bg-gray-100"}
                `}
                onClick={() => {
                  const firstItemPath = menu.items[0]?.path;
                  if (firstItemPath && firstItemPath !== '/') {
                    navigate(firstItemPath);
                  }
                }}
              >
                {menu.title}
              </div>
            ))}
          </div>

          {/* 오른쪽 스크롤 버튼 */}
          {showScrollButtons && (
            <button
              onClick={() => handleScroll('right')}
              className="flex-none px-2 ml-2 text-gray-600 hover:text-[#2A5D9F] focus:outline-none"
              style={{ fontSize: '1.5rem' }}
            >
              {'>'}
            </button>
          )}
        </div>

        {/* 우측: 현황 및 모니터링 토글 스위치 */}
        <div className="flex-none flex items-center pl-10">
          <div className="cursor-pointer flex items-center gap-2" onClick={handleToggle}>
            <div className="text-xs font-bold text-gray-700 whitespace-nowrap">현황 및 모니터링</div>
            <div className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${isMonitoring ? 'bg-green-500 justify-end' : 'bg-gray-400 justify-start'}`}>
              <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}