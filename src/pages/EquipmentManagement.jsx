import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const EQUIPMENT_API_URL = "http://localhost:8082/api/equipment";

export default function EquipmentManagement({ workCenterId }) {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid #ccc' }}>
      <h3 style={{ margin: 0, padding: '10px', backgroundColor: '#f2f2f2' }}>
        {workCenterId ? `${workCenterId} 관련 설비` : '설비 (작업장을 선택하세요)'}
      </h3>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? <p>로딩 중...</p> : 
          <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#eee' }}>
                <th>No.</th>
                <th>설비 ID</th>
                <th>설비명</th>
                <th>타입</th>
                <th>활성여부</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((eq , idx) => (
                <tr key={eq.equipmentId}>
                  <td>{idx+1}</td>
                  <td>{eq.equipmentId}</td>
                  <td>{eq.equipmentId}</td>
                  <td>{eq.equipmentNm}</td>
                  <td>{eq.equipmentType}</td>
                  <td>{eq.isActive ? '활성' : '비활성'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>
    </div>
  );
}