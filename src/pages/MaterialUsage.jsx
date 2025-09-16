import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useIconContext } from '../utils/IconContext';
import MaterialSelectionModal from './MaterialSelectionModal.jsx';

const MATERIALS_API_URL = "http://localhost:8082/api/materials";

export default function MaterialUsage() {
  // --- 상태 관리 ---
  const [allMaterials, setAllMaterials] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- IconContext 연동 ---
  const { setIconHandlers } = useIconContext();

  // --- 데이터 조회 ---
  const fetchAllMaterials = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await axios.get(MATERIALS_API_URL);
    setAllMaterials(response.data);
  } catch (err) {
    setError(err);
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    fetchAllMaterials();
  }, [fetchAllMaterials]);

  // --- 이벤트 핸들러 ---
  const handleConfirmSelection = (selectedFromModal) => {
    const newRows = selectedFromModal.map(mat => ({
      ...mat,
      usageQuantity: '', // 사용량 입력 필드를 위해 빈 값으로 초기화
    }));
    
    setSelectedRows(prevRows => {
      const existingIds = new Set(prevRows.map(row => row.materialId));
      const uniqueNewRows = newRows.filter(row => !existingIds.has(row.materialId));
      return [...prevRows, ...uniqueNewRows];
    });
    setIsModalOpen(false);
  };

  const handleQuantityChange = (materialId, value) => {
    setSelectedRows(prevRows =>
      prevRows.map(row =>
        row.materialId === materialId ? { ...row, usageQuantity: parseInt(value) || 0 } : row
      )
    );
  };

  // '신규' 아이콘 클릭 시 실행될 함수
  const handleNew = () => setIsModalOpen(true);
  
  // '저장' 아이콘 클릭 시 실행될 함수 (기능 없음)
  const handleSave = () => {
    alert("저장 기능은 구현되지 않았습니다.");
  };

  // --- 사이드 이펙트: IconContext에 핸들러 등록 ---
  useEffect(() => {
    // onSave에는 기능이 없는 handleSave 함수를 연결하여 클릭은 가능하게 하되, 서버 요청은 막습니다.
    setIconHandlers({ onNew: handleNew, onSave: handleSave, onSearch: null, onDelete: null });
    return () => {
      setIconHandlers({ onNew: null, onSave: null });
    };
  }, [setIconHandlers]); // selectedRows 의존성 제거

  // --- 렌더링 ---
  if (loading) return <p>전체 자재 목록을 불러오는 중입니다...</p>;
  if (error) return <p>에러 발생: {error.message}</p>;

  return (
    <div style={{ padding: '20px', height: '100%' }}>
      <div style={{ backgroundColor: 'white', padding: '20px', border: '1px solid #ddd' }}>
        <h2>자재 사용 등록</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#eef1f5' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>자재 ID</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>자재명</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>현재고</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>사용량</th>
            </tr>
          </thead>
          <tbody>
            {selectedRows.map((row) => (
              <tr key={row.materialId}>
                <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>{row.materialId}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{row.materialNm}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>{row.currentStock}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <input
                    type="number"
                    value={row.usageQuantity}
                    onChange={(e) => handleQuantityChange(row.materialId, e.target.value)}
                    placeholder="사용량 입력"
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box', textAlign: 'right' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <MaterialSelectionModal 
          materials={allMaterials}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmSelection}
        />
      )}
    </div>
  );
}