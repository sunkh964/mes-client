import { useState, useEffect } from "react";

export default function useKeyboard(items, onSelect, selectedItem, idKey='id') {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // items 또는 초기 선택 항목이 변경될 때 선택 인덱스 동기화
  useEffect(() => {
    if (!items || items.length === 0) return;
    const initialIndex = items.findIndex(item => item[idKey] === selectedItem?.[idKey]);
    setSelectedIndex(initialIndex !== -1 ? initialIndex : 0);
  }, [items, selectedItem, idKey]);

  // 키보드 이벤트 핸들러
  useEffect(() => {
    if (!items || items.length === 0) return;

    const handleKeyDown = (e) => {
      // 위쪽 화살표 키
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prevIndex => {
          const newIndex = Math.max(prevIndex - 1, 0);
          onSelect(items[newIndex]);
          return newIndex;
        });
      }
      // 아래쪽 화살표 키
      else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prevIndex => {
          const newIndex = Math.min(prevIndex + 1, items.length - 1);
          onSelect(items[newIndex]);
          return newIndex;
        });
      }
      // Enter 키
      else if (e.key === "Enter") {
        e.preventDefault();
        onSelect(items[selectedIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items, onSelect, selectedIndex]);

  return { selectedIndex };
}