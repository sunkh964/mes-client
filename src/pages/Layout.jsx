import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "../layouts/Header";
import UserLayout from "../layouts/UserLayout";
import routeConfig from "../config/routeConfig";
import { getToken } from "../utils/api";
import { useEffect, useState } from "react";

export default function Layout({onLogout}) {
  const location = useLocation();
  const navigate = useNavigate();

  //열려있는 메뉴를 관리
  const [openMenus, setOpenMenus] = useState([]);

  // const getPageTitle = () => {
  //   const path = location.pathname;
  //   const matched = routeConfig.find((route) => path.startsWith(route.title));
  //   return matched?.pageTitle || "";
  // };

  const getPageTitle = () => {
    const path = location.pathname;

    // routeConfig를 순회하며 현재 경로와 일치하는 상세 메뉴를 찾습니다.
    for (const route of routeConfig) {
      // 상세 메뉴(items) 배열을 순회합니다.
      const matchedItem = route.items.find((item) => item.path === path);
      if (matchedItem) {
        // 일치하는 항목을 찾으면 해당 부모의 pageTitle을 반환합니다.
        return route.pageTitle;
      }
    }

    // 일치하는 항목이 없으면 빈 문자열을 반환합니다.
    return "";
  };

  const hideUserLayout = location.pathname === "/main/dashboard";

  // 로그인 토큰 검사 및 리다이렉트 처리
  useEffect(() => {
    const token = getToken();
    if (!token) {
      // 로그인 페이지로 이동 (현재 페이지 저장 없이)
      navigate("/login", { replace: true });
    }
}, [location.pathname, navigate]);
  

  return (
    <div className="min-h-screen bg-[#2d2d2d]
        flex justify-center items-start">
      {/* 내부 콘텐츠 박스: 배경 하얀색, 기존 스타일 유지 */}
      <div className="flex flex-col bg-gray-200 text-[#2f3542] w-full shadow-lg overflow-hidden"
           style={{ height: '100vh' }}>

        {/* 상단 고정 헤더 */}
        <Header  openMenus={openMenus} setOpenMenus={setOpenMenus}/>

        {/* 본문 전체 */}
        <div className="pb-3 flex flex-1 w-full overflow-hidden h-full">
          {/* 좌측 드롭다운 메뉴 - 조건부 렌더링 */}
          {!hideUserLayout && (
            <div className="w-64 bg-gray-200 h-full"> 
            {/* border-r border-[#bdc3c7] */}
              <UserLayout
                onLogout={onLogout}
                openMenus={openMenus}
                setOpenMenus={setOpenMenus}
              />
            </div>
          )}

          {/* 우측 메인 콘텐츠 - 좌측 메뉴가 없으면 full width */}
          <div
            className={`flex-1 flex flex-col bg-white ml-2 mr-3 ${
              hideUserLayout ? "w-full" : ""
            }`} 
          >
            {/* 클릭한 페이지의 메인 타이틀 */}
            {!hideUserLayout && (
              <div className="bg-gray-200 px-2 py-3 flex justify-between items-center border-b border-gray-300">

                {/* 왼쪽: 타이틀 */}
                <div
                  className="text-[1.25rem] font-semibold text-[#2A5D9F]"
                >
                  ▶ {getPageTitle()}
                </div>

                {/* 오른쪽: 아이콘 버튼 그룹 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center cursor-pointer hover:opacity-80">
                    <img src="/icons/new.png" alt="신규" className="w-6 h-6 mb-1" />
                    <span className="text-xs text-gray-600">신규</span>
                  </div>
                  <div className="flex flex-col items-center cursor-pointer hover:opacity-80">
                    <img src="/icons/search.png" alt="조회" className="w-6 h-6 mb-1" />
                    <span className="text-xs text-center text-gray-600">조회</span>
                  </div>
                  {/* ...다른 아이콘들도 동일하게 추가 */}
                </div>
              </div>
            )}

            {/* 실제 내용 영역 */}
            <main className="flex-1 p-6 overflow-auto bg-[#ffffff]"
                  style={{ 
                  boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.4)",
                  maxHeight: '100%', //스크롤바 적용시 필요
                }}
            >
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}