// src/context/IconContext.jsx
import React, { createContext, useContext, useState } from "react";

const IconContext = createContext();

export const useIconContext = () => useContext(IconContext);

export const IconProvider = ({ children }) => {
  // 아이콘 버튼 클릭 시 호출될 핸들러들 초기값 null
  const [handlers, setHandlers] = useState({
    onNew: null,
    onSearch: null,
    onSave: null,
    onDelete: null,
  });

  // 핸들러를 한번에 업데이트하는 함수
  const setIconHandlers = (newHandlers) => {
    setHandlers((prev) => ({ ...prev, ...newHandlers }));
  };

  return (
    <IconContext.Provider value={{ ...handlers, setIconHandlers }}>
      {children}
    </IconContext.Provider>
  );
};
