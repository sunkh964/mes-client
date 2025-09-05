import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import logo from "../images/logo.png";
import routesConfig from "../config/routeConfig";

export default function Header({ openMenus, setOpenMenus }) {
  const navigate = useNavigate();
  const location = useLocation(); // 현재 경로 정보를 가져오는 Hook
  const scrollContainerRef = useRef(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);

  
  const [isMonitoring, setIsMonitoring] = useState(false);

 useEffect(() => {
    if (window.location.pathname.startsWith("/main/dashboard")) {
      setIsMonitoring(true);
    } else {
      setIsMonitoring(false);
    }
  }, [location.pathname]);

  // 화면 너비에 따른 스크롤 버튼 표시 로직 (기존 코드 유지)
  useEffect(() => {
    const checkOverflow = () => {
      if (scrollContainerRef.current) {
        const isOverflowing = scrollContainerRef.current.scrollWidth > scrollContainerRef.current.clientWidth;
        setShowScrollButtons(isOverflowing);
      }
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, []);

  // 토글 클릭 시 네비게이션 로직 수정
  const handleToggle = () => {
    if (isMonitoring) {
      // ON -> OFF: 대시보드가 아닌 기준정보 관리의 첫 페이지로 이동
      navigate('/main/processes');
    } else {
      // OFF -> ON: 대시보드로 이동
      navigate('/main/dashboard');
    }
  };

  // 현재 활성화된 대분류 메뉴를 찾는 로직 수정
  const getActiveMenuTitle = () => {
    // 현재 경로가 '/'이면 '대시보드'를 활성화
    if (location.pathname === '/main/dashboard') {
        // routeConfig에서 '대시보드' title을 찾아 반환
        const dashboardMenu = routesConfig.find(menu => menu.items.some(item => item.path === '/'));
        return dashboardMenu ? dashboardMenu.title : "";
    }
    // 다른 경로일 경우, 해당 경로가 속한 대분류를 찾음
    for (const route of routesConfig) {
      if (route.items.some((item) => location.pathname.startsWith(item.path))) {
        return route.title;
      }
    }
    return "";
  };

  const activeTitle = getActiveMenuTitle();

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 150;
      scrollContainerRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div>
      {/* 상단 섹션 */}
      <div className="bg-gray-200 border-b border-gray-300 px-7 py-1 flex items-center justify-between">
        
        {/* 좌측: 로고/회사명 */}
        <div className="flex-none flex items-center pr-4" onClick={() => navigate('/')}>
          <img src={logo} alt="로고" className="mr-2 cursor-pointer" style={{ height: "50px" }} />
          <div className="text-lg font-bold text-gray-700 cursor-pointer" style={{ color: "#304c70ff" }}>
            (주)스팩중공업 MES
          </div>
        </div>

        {/* 중앙: 빠른 메뉴 */}
        <div className="px-2 flex items-center overflow-hidden">
          {showScrollButtons && ( <button onClick={() => handleScroll('left')} className="flex-none px-2 mr-2 text-gray-600 hover:text-black focus:outline-none" style={{ fontSize: '1.5rem'}} > {'<'} </button> )}
          <div ref={scrollContainerRef} className="flex flex-1 overflow-x-auto gap-x-3 whitespace-nowrap scrollbar-hide md:gap-x-6 md:whitespace-normal md:overflow-hidden">
            {routesConfig.map((menu) => (
              <div
                key={menu.title}
                className={`flex-none w-28 h-11 flex items-center justify-center text-xs font-semibold border border-gray-300 cursor-pointer transition-colors duration-200 ${activeTitle === menu.title ? "bg-white text-gray-900 border-gray-400" : "bg-white text-gray-700 hover:bg-gray-100"}`}
                onClick={() => {
                  // routeConfig에 있는 path를 직접 사용
                  if (menu.path) {
                    navigate(menu.path);
                    if (!openMenus.includes(menu.title)) {
                      setOpenMenus([menu.title]);
                    }
                  }
                }}
              >
                {menu.title}
              </div>
            ))}
          </div>
          {showScrollButtons && ( <button onClick={() => handleScroll('right')} className="flex-none px-2 ml-2 text-gray-600 hover:text-black focus:outline-none" style={{ fontSize: '1.5rem' }} > {'>'} </button> )}
        </div>

        {/* 우측: 토글 스위치 */}
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