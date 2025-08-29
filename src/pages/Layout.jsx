import { Outlet, useLocation } from "react-router-dom";
import Header from "../layouts/Header";
import UserLayout from "../layouts/UserLayout";
import routeConfig from "../config/routeConfig";

export default function Layout() {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    const matched = routeConfig.find((route) => path.startsWith(route.title));
    return matched?.pageTitle || "";
  };

  const hideUserLayout = location.pathname === "/monitoring";
  

  return (
    <div className="min-h-screen bg-[#2d2d2d] p-8
        flex justify-center items-start">
      {/* 내부 콘텐츠 박스: 배경 하얀색, 기존 스타일 유지 */}
      <div className="flex flex-col bg-gray-200 text-[#2f3542] w-full max-w-[1400px] shadow-lg overflow-hidden"
           style={{ height: '92vh' }}>

        {/* 상단 고정 헤더 */}
        <Header />

        {/* 본문 전체 */}
        <div className="pb-3 flex flex-1 w-full overflow-hidden h-full">
          {/* 좌측 드롭다운 메뉴 - 조건부 렌더링 */}
          {!hideUserLayout && (
            <div className="w-64 bg-gray-200 h-full"> 
            {/* border-r border-[#bdc3c7] */}
              <UserLayout/>
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
              <div className="bg-gray-200 text-base font-semibold px-2 py-4 "
            //   border-b border-[#bdc3c7]
                    style={{ color: '#2A5D9F' }}>
                ▶ {getPageTitle()}
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
