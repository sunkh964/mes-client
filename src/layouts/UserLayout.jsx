import { useState } from "react";
import { useNavigate } from "react-router-dom";
import routeConfig from "../config/routeConfig"; // 설정 파일 import

export default function UserLayout() {
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState([]);

  // ✨ handleMenuClick 로직 수정
  const handleMenuClick = (menu) => {
    const menuTitle = menu.title;
    const isOpen = openMenus.includes(menuTitle);

    // 메뉴 열고 닫기 로직
    if (isOpen) {
      setOpenMenus(openMenus.filter((title) => title !== menuTitle));
    } else {
      setOpenMenus([...openMenus, menuTitle]);
    }

    // 하위 메뉴가 있을 경우, 첫 번째 하위 메뉴의 경로로 이동
    if (menu.items && menu.items.length > 0) {
      navigate(menu.items[0].path);
    }
  };

  return (
    <div className="bg-gray-200 flex flex-col h-full">
      {/* 상단 인사말 */}
      <div
        className="px-8 pt-7 pb-2 font-semibold text-gray-600 select-none flex items-end justify-end"
        style={{ fontSize: "0.875rem" }}
      >
        {} 님 반갑습니다.
      </div>

      {/* 메뉴 리스트 영역 */}
      <div className="flex-1 pl-2 pr-2 py-0 overflow-hidden">
        <ul
          className="h-full max-h-full px-5 py-6 space-y-6 border border-gray-300 bg-gray-200 overflow-auto"
          style={{ 
            boxShadow: "0px 5px 8px rgba(0, 0, 0, 0.5)",
            maxHeight: '100%',
          }}
        >
          {routeConfig.map((menu, index) => (
            <li key={index}>
              <div
                className="font-semibold text-gray-900 cursor-pointer hover:underline select-none"
                // ✨ onClick 핸들러가 이제 menu 객체 전체를 전달
                onClick={() => handleMenuClick(menu)}
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