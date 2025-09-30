import React, { useState } from "react";
import TableGrid from "../layouts/TableGrid";

export default function MaterialSelectionModal({ materials, onClose, onConfirm }) {
  const [selectedIds, setSelectedIds] = useState([]);

  const handleCheckboxChange = (materialId) => {
    setSelectedIds((prev) =>
      prev.includes(materialId)
        ? prev.filter((id) => id !== materialId) // 이미 있으면 제거
        : [...prev, materialId]                  // 없으면 추가
    );
  };

  const handleConfirm = () => {
    const selectedMaterials = materials.filter((m) =>
      selectedIds.includes(m.materialId)
    );
    onConfirm(selectedMaterials);
  };

  // TableGrid 컬럼 정의
  const columns = [
    
    { header: "자재명", accessor: "materialNm" },
    { header: "규격", accessor: "specification" },
    {
      header: "현재고",
      accessor: "onHand",
    },
    {
      header: "✔",
      accessor: "checkbox",
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row.materialId)}
          onChange={() => handleCheckboxChange(row.materialId)}
        />
      ),
    },
  ];

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex", justifyContent: "center", alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          width: "700px",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>자재 선택</h2>

        {/* TableGrid 적용 */}
        <div style={{ flex: 1, overflowY: "auto", marginBottom: "20px" }}>
          <TableGrid
            columns={columns}
            data={materials}
            readOnly={true}
            rowKey="materialId"
          />
        </div>

        <div style={{ textAlign: "right" }}>
          <button onClick={onClose} style={{ marginRight: "10px", padding: "8px 16px" }}>
            취소
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
