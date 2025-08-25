import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export default function UserLayout() {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null); //현재 열려 있는 메뉴 제목

  const handleMenuClick = (menuTitle) => {
    // 클릭 시 같은 메뉴면 닫고, 아니면 열기
    setOpenMenu((prev) => (prev === menuTitle ? null : menuTitle));
  };

  const handleNavigation = (path) => {
    navigate(path);
    setOpenMenu(null); // 이동 후 드롭다운 닫기 
  };

  const menus = [
    {
      title: '기준 정보 관리',
      items: [
        { name: '공정 정보관리', path: '/process-management' },
        { name: '작업자 관리', path: '/standard2' },
        { name: '작업장 관리', path: '/workcenter-management' },
        { name: '자재 조회', path: '/' },
        { name: 'BOM 조회', path: '/' },
      ],
    },
    {
      title: '생산관리',
      items: [
        { name: '생산계획 조회', path: '/processplan-management' },
        { name: '작업지시 조회', path: '/workorder-management' },
        { name: '생산진행 현황', path: '/dashboard' },
      ],
    },
    {
      title: '공정관리',
      items: [
        { name: '공정 계획 관리', path: '/' },
        { name: '작업지시 선택/변경', path: '/' }, 
        { name: '작업 시작/종료', path: '/work-orders' },
        { name: '실적 등록', path: '/work-results-log' },
      ],
    },
    {
      title: '자재관리',
      items: [
        { name: '자재 투입 등록', path: '/material-input' },
        { name: '자재 산출 등록', path: '/material-output' }, 
        { name: '자재 재고 현황', path: '/material-inventory' },
      ],
    },
    {
      title: '설비관리',
      items: [
        { name: '설비어쩌구', path: '/' },
        { name: '섧비저쩌구', path: '/' },
      ],
    },
  ];

   return (
    <div>
      <ul className="space-y-4">
        {menus.map((menu, index) => (
          <li key={index}>
            <div
              className="font-semibold text-blue-800 cursor-pointer hover:underline"
              onClick={() => handleMenuClick(menu.title)}
            >
              {menu.title}
            </div>
            {openMenu === menu.title && (
              <ul className="ml-4 mt-2 border-l border-gray-300 pl-2 space-y-1">
                {menu.items.map((item, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-gray-700 cursor-pointer hover:text-blue-600"
                    onClick={() => navigate(item.path)}>
                    - {item.name}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
