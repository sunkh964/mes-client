// src/layouts/Layout.jsx
import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "../layouts/Header";
import UserLayout from "../layouts/UserLayout";
import routeConfig from "../config/routeConfig";
import { getToken } from "../utils/api";

import iconNew from "../images/new.png";
import iconSearch from "../images/search.png";
import iconSave from "../images/save.png";
import iconDelete from "../images/delete.png";

import { useIconContext } from "../utils/IconContext";

export default function Layout({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [openMenus, setOpenMenus] = useState([]);

  const { onNew, onSearch, onSave, onDelete } = useIconContext();

  const getPageTitle = () => {
    const path = location.pathname;
    for (const route of routeConfig) {
      const matchedItem = route.items.find((item) => item.path === path);
      if (matchedItem) return route.pageTitle;
    }
    return "";
  };

  const hideUserLayout = location.pathname === "/main/dashboard";

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-[#2d2d2d] flex justify-center items-start">
      <div
        className="flex flex-col bg-gray-200 text-[#2f3542] w-full  overflow-hidden"
        style={{ height: "100vh" }}
      >
        <Header openMenus={openMenus} setOpenMenus={setOpenMenus} />

        <div className="pb-3 flex flex-1 w-full overflow-hidden h-full">
          {!hideUserLayout && (
            <div className="w-64 bg-gray-200 h-full">
              <UserLayout
                onLogout={onLogout}
                openMenus={openMenus}
                setOpenMenus={setOpenMenus}
              />
            </div>
          )}

          <div
            className={`flex-1 flex flex-col bg-white ml-2 mr-3 ${
              hideUserLayout ? "w-full" : ""
            }`}
          >
            {!hideUserLayout && (
              <div className="bg-gray-200 px-2 py-3 flex justify-between items-center border-b border-gray-300">
                <div className="text-[1.25rem] font-semibold text-[#2A5D9F]">
                  ▶ {getPageTitle()}
                </div>

                {/* 오른쪽: 아이콘 버튼 그룹 */}
                <div className="flex gap-7 mr-5">
                  <div
                    className="flex flex-col items-center cursor-pointer hover:opacity-80"
                    onClick={() => onNew && onNew()}
                  >
                    <img
                      src={iconNew}
                      alt="신규"
                      className="w-7 h-7 shadow-lg bg-gray"
                    />
                    <span className="text-xs text-gray-600 font-semibold">
                      신규
                    </span>
                  </div>

                  <div
                    className="flex flex-col items-center cursor-pointer hover:opacity-80"
                    onClick={() => onDelete && onDelete()}
                  >
                    <img src={iconDelete} alt="삭제" className="w-7 h-7" />
                    <span className="text-xs text-center text-gray-600 font-semibold">
                      삭제
                    </span>
                  </div>

                  <div
                    className="flex flex-col items-center cursor-pointer hover:opacity-80"
                    onClick={() => onSearch && onSearch()}
                  >
                    <img src={iconSearch} alt="조회" className="w-7 h-7" />
                    <span className="text-xs text-center text-gray-600 font-semibold">
                      조회
                    </span>
                  </div>

                  <div
                    className="flex flex-col items-center cursor-pointer hover:opacity-80"
                    onClick={() => onSave && onSave()}
                  >
                    <img src={iconSave} alt="저장" className="w-7 h-7" />
                    <span className="text-xs text-center text-gray-600 font-semibold">
                      저장
                    </span>
                  </div>
                </div>
              </div>
            )}

            <main
              className="flex-1 p-6 overflow-auto bg-[#ffffff]"
              style={{
                boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.4)",
                maxHeight: "100%",
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