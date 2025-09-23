import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import TableGrid from '../layouts/TableGrid';

const EQUIPMENT_API_URL = "http://localhost:8082/api/equipment";

export default function EquipmentManagement({ workCenterId }) {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const fetchEquipment = useCallback(async (id) => {
    // id가 없을 경우, 전체 설비 목록을 가져오도록 URL을 설정합니다.
    const fullUrl = id 
      ? `${EQUIPMENT_API_URL}?workCenterId=${id}` // id가 있으면 필터링
      : EQUIPMENT_API_URL;                        // id가 없으면 전체 조회
  
    setLoading(true);
    try {
      const response = await axios.get(fullUrl);
      setEquipment(response.data);
    } catch (err) {
      console.error("설비 데이터 로드 실패:", err);
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEquipment(workCenterId);
  }, [workCenterId, fetchEquipment]);

  // TableGrid 컬럼
  const columns = [
    { header: "설비 ID", accessor: "equipmentId" },
    { header: "설비명", accessor: "equipmentNm" },
    { header: "타입", accessor: "equipmentType" },
    { header: "활성 여부", accessor: "isActive" },
  ];

  // 데이터 전처리 (true/false → 활성/비활성)
  const processedData = equipment.map((eq) => ({
    ...eq,
    isActive: eq.isActive ? "활성" : "비활성",
  }));

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid #ccc' }}>
      <h3 style={{ margin: 0, padding: '10px', backgroundColor: '#f2f2f2' }}>
        {workCenterId ? `${workCenterId} 관련 설비` : '설비 (작업장을 선택하세요)'}
      </h3>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="p-4">로딩 중...</p>
        ) : (
          <TableGrid
            columns={columns}
            data={processedData}
            rowKey="equipmentId"
            selectedRow={selectedRow}
            onRowSelect={setSelectedRow}
            readOnly={true} //
          />
        )}
      </div>
    </div>
  );
}