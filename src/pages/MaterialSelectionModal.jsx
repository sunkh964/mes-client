import React, { useState } from 'react';


export default function MaterialSelectionModal({ materials, onClose, onConfirm }) {
    
  // 어떤 자재들이 체크되었는지 ID를 배열로 관리하는 상태
  const [selectedIds, setSelectedIds] = useState([]);

  // 체크박스 상태가 변경될 때 호출되는 함수
  const handleCheckboxChange = (materialId) => {
    setSelectedIds(prevSelected => 
      prevSelected.includes(materialId) 
        ? prevSelected.filter(id => id !== materialId) // 이미 배열에 ID가 있으면 제거 (체크 해제)
        : [...prevSelected, materialId]                 // 배열에 ID가 없으면 추가 (체크)
    );
  };

  // '확인' 버튼을 클릭했을 때 호출되는 함수
  const handleConfirm = () => {
    // props로 받은 전체 자재 목록(materials)에서,
    // 사용자가 선택한 ID 목록(selectedIds)에 포함되는 자재들만 필터링합니다.
    const selectedMaterials = materials.filter(material => selectedIds.includes(material.materialId));
    
    // 필터링된 최종 자재 객체 배열을 부모 컴포넌트로 전달합니다.
    onConfirm(selectedMaterials);
  };

  return (
    // 모달 배경 (화면 전체를 덮는 반투명 레이어)
    <div style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        zIndex: 1000 
    }}>
      {/* 모달 본문 */}
      <div style={{ 
          backgroundColor: 'white', padding: '20px', borderRadius: '8px', 
          width: '600px', maxHeight: '80vh', 
          display: 'flex', flexDirection: 'column' 
      }}>
        <h2 style={{ marginBottom: '20px' }}>자재 선택</h2>
        
        {/* 자재 목록 (스크롤 가능) */}
        <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #ccc', marginBottom: '20px' }}>
          {materials.map((mat,idx) => (
            <div key={mat.materialId} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
              <label style={{ display: 'flex', alignItems: 'center', width: '100%', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(mat.materialId)} 
                  onChange={() => handleCheckboxChange(mat.materialId)}
                />
                <span className='px-2'>{idx+1}.</span>
                <span style={{ marginLeft: '10px', flex: 1 }}>{mat.materialNm}</span>
                <span style={{ color: '#666', flex: 1 }}>{mat.specification}</span>
                <span style={{ color: 'blue', flex: 0.5, textAlign: 'right' }}>현재고: {mat.onHand}</span>
              </label>
            </div>
          ))}
        </div>
        
        {/* 하단 버튼 그룹 */}
        <div style={{ textAlign: 'right' }}>
          <button onClick={onClose} style={{ marginRight: '10px', padding: '8px 16px' }}>취소</button>
          <button onClick={handleConfirm} style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>확인</button>
        </div>
      </div>
    </div>
  );
}