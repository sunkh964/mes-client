import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import routeConfig from "../config/routeConfig";

export default function UserLayout({onLogout, openMenus, setOpenMenus }) {
  const navigate = useNavigate();
  //const [openMenus, setOpenMenus] = useState([]);
  const [role, setRole] = useState("");
  // 직원 ID 상태 추가
  const [employeeId, setEmployeeId] = useState("");

                     

  useEffect(() => {
    const storedEmployeeId = localStorage.getItem('employeeId');
    const storedRole = localStorage.getItem('role');  // ← 역할 불러오기
    if(storedEmployeeId){
      setEmployeeId(storedEmployeeId);
    }
    if(storedRole){
      setRole(storedRole);
    }
  }, []);

  const handleMenuClick = (menuTitle, path) => {
    // 현재 클릭한 메뉴가 이미 열려있는지 확인
    const isOpen = openMenus.includes(menuTitle);

    if (isOpen) {
      // 이미 열려있다면 닫기 (배열에서 제거)
      setOpenMenus(openMenus.filter((title) => title !== menuTitle));
    } else {
      // 닫혀있다면 열기 (배열에 추가)
      setOpenMenus([...openMenus, menuTitle]);
    }
    
    navigate(path);
  };

  // 로그아웃
  const handleLogout = () => {
    // 로컬 스토리지에서 토큰 및 사용자 정보 삭제
    localStorage.removeItem('token');
    localStorage.removeItem('employeeId');
    localStorage.removeItem('role');

    // App 상태 초기화
    onLogout();

    // 확실한 리디렉션 (리액트 라우터가 아닌 브라우저 강제 이동 역할)
    window.location.href = '/login';
    };

  return (
    <div className="bg-gray-200 flex flex-col h-full pt-3 ">      
        <div className="flex justify-between items-center pb-2 pl-3 pr-2 pt-2">
          {/* 상단 인사말 */}
          <div
            className="font-semibold text-gray-600 select-none"
            style={{ fontSize: "0.8rem" }}
          >
            [ {employeeId} ] 님 반갑습니다.
          </div>
          {/* 로그아웃 버튼 */}
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
        >= 프로그램 목록</div>
        <ul
          className="h-full max-h-full px-5 py-6 space-y-6 border border-gray-300 bg-gray-200 overflow-auto"
          style={{ 
            boxShadow: "0px 5px 8px rgba(0, 0, 0, 0.5)",
            maxHeight: '100%', //스크롤바 적용시 필요
          }}
        >
          {routeConfig.map((menu, index) => (
            <li key={index}>
              <div
                className="font-semibold text-gray-900 cursor-pointer hover:underline select-none"
                onClick={() => handleMenuClick(menu.title, menu.path)}
              >
                {menu.title}
              </div>

              {openMenus.includes(menu.title) && menu.items.length > 0 && (
                <ul className="ml-4 mt-2 border-l border-gray-400 pl-4 space-y-1">
                  {menu.items.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-700 cursor-pointer hover:text-blue-600 select-none"
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
