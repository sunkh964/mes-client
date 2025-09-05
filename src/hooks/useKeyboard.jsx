import { useEffect, useRef } from "react";

export default function useKeyboard(items, onSelect) {
  const selectedIndexRef = useRef(0);

  useEffect(() => {
    if (!items || items.length === 0) return;

    // 초기 선택 인덱스 초기화
    selectedIndexRef.current = 0;
    onSelect(items[0], 0);

    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        selectedIndexRef.current = Math.min(selectedIndexRef.current + 1, items.length - 1);
        onSelect(items[selectedIndexRef.current], selectedIndexRef.current);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        selectedIndexRef.current = Math.max(selectedIndexRef.current - 1, 0);
        onSelect(items[selectedIndexRef.current], selectedIndexRef.current);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items, onSelect]);
}
