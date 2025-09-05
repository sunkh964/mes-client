import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // useLocation 추가
import routeConfig from "../config/routeConfig";

export default function UserLayout({onLogout, openMenus, setOpenMenus }) {
  const navigate = useNavigate();
  const location = useLocation(); // 현재 경로를 가져오는 훅
  const [role, setRole] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  
  // 현재 활성화된 메인 메뉴를 추적하는 상태
  const [activeMainMenu, setActiveMainMenu] = useState(null);

  useEffect(() => {
    const storedEmployeeId = localStorage.getItem('employeeId');
    const storedRole = localStorage.getItem('role'); 
    if(storedEmployeeId){
      setEmployeeId(storedEmployeeId);
    }
    if(storedRole){
      setRole(storedRole);
    }
  }, []);

  // 활성화된 메뉴 상태 업데이트
  useEffect(() => {
    const currentPath = location.pathname;
    // routeConfig를 순회 -> 현재 경로가 어떤 메뉴에 속하는지 확인
    for (const menu of routeConfig) {
      // 메인 메뉴의 path와 일치하거나, 서브 메뉴의 path가 현재 경로로 시작하는지 확인
      if (currentPath === menu.path || menu.items.some(item => currentPath.startsWith(item.path))) {
        // 일치하는 메뉴를 찾으면 해당 메뉴를 '열린' 메뉴로 설정
        setOpenMenus(prevMenus => {
            const newMenus = new Set(prevMenus);
            newMenus.add(menu.title);
            return Array.from(newMenus);
        });
        // 활성화된 메인 메뉴도 설정
        setActiveMainMenu(menu.title);
        return;
      }
    }
    // 일치하는 메뉴가 없으면 활성화된 메뉴 상태 초기화
    setActiveMainMenu(null);
  }, [location.pathname, setOpenMenus]);

  const handleMenuClick = (menuTitle, path) => {
    const isOpen = openMenus.includes(menuTitle);
    if (isOpen) {
      setOpenMenus(openMenus.filter((title) => title !== menuTitle));
    } else {
      setOpenMenus([...openMenus, menuTitle]);
    }
    
    // 메인 메뉴 클릭 시에도 라우팅
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('employeeId');
    localStorage.removeItem('role');

    onLogout();
    window.location.href = '/login';
  };

  return (
    <div className="bg-gray-200 flex flex-col h-full pt-3 "> 
      {/* 상단 인사말 및 로그아웃 버튼 */}
      <div className="flex justify-between items-center pb-2 pl-3 pr-2 pt-2">
        <div
          className="font-semibold text-gray-600 select-none"
          style={{ fontSize: "0.8rem" }}
        >
          [ {employeeId} ] 님 반갑습니다.
        </div>
        <button 
          onClick={handleLogout}
          className="font-semibold text-gray-600 px-2 py-1 text-[#eeeeee] bg-slate-400
                     hover:bg-slate-600 transition-colors"
          style={{ fontSize: "0.6rem" , border: "none"}}>
          로그아웃
        </button>
      </div>
    
      {/* 메뉴 리스트 영역 */}
      <div className="flex-1 pt-2 pl-2 pr-2 py-0 overflow-hidden">
        <div className="bg-[#4B709E] px-3 text-base font-semibold"
              style={{width:"60%", fontSize: "0.8rem",
                      WebkitBorderTopRightRadius: "10px", color: 'white'
              }}
        >
          = 프로그램 목록
        </div>
        <ul
          className="h-full max-h-full px-5 py-6 space-y-6 border border-gray-300 bg-gray-200 overflow-auto"
          style={{ 
            boxShadow: "0px 5px 8px rgba(0, 0, 0, 0.5)",
            maxHeight: '100%',
          }}
        >
          {routeConfig.map((menu, index) => (
            <li key={index}>
              {/* 메인 메뉴 스타일 변경 */}
              <div
                className={`font-semibold cursor-pointer select-none 
                  ${activeMainMenu === menu.title ? 'text-blue-800' : 'text-gray-800 hover:text-black'}`}
                onClick={() => handleMenuClick(menu.title, menu.path)}
              >
                {menu.title}
              </div>

              {/* 서브 메뉴 리스트 */}
              {openMenus.includes(menu.title) && menu.items.length > 0 && (
                <ul className="ml-4 mt-2 border-l border-gray-400 pl-4 space-y-1">
                  {menu.items.map((item, idx) => (
                    <li
                      key={idx}
                      className={`text-sm cursor-pointer select-none
                        ${location.pathname === item.path ? 'font-bold underline' : 'text-gray-700 hover:text-blue-600'}`}
                      onClick={() => navigate(item.path)}
                    >
                      - {item.name}
                    </li>
                  ))}
                </ul>
              )}

              {index !== routeConfig.length - 1 && (
                <hr className="my-4 border-gray-300" />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}