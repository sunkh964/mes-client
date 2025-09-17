import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useIconContext } from "../utils/IconContext";
import EquipmentManagement from "./EquipmentManagement";

const WORK_CENTER_API_URL = "http://localhost:8082/api/work-centers";

export default function WorkCenterManagement() {
  const [workCenters, setWorkCenters] = useState([]);
  const [selectedWorkCenterId, setSelectedWorkCenterId] = useState(null);
  const [searchParams, setSearchParams] = useState({
    workCenterId: "",
    workCenterNm: "",
    isActive: null,
    processId: "",
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { setIconHandlers } = useIconContext();

  const fetchWorkCenters = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams(
        Object.entries(params).filter(([, value]) => value !== '' && value !== null)
      ).toString();
      const fullUrl = `${WORK_CENTER_API_URL}${queryParams ? `?${queryParams}` : ''}`;
      const response = await axios.get(fullUrl);
      setWorkCenters(response.data);
      if (response.data.length > 0) {
        setSelectedWorkCenterId(response.data[0].workCenterId); // 첫 번째 항목 선택
      }
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []); // 빈 배열로 설정하여 함수가 재생성되지 않도록 함
  
  useEffect(() => {
    fetchWorkCenters();
  }, [fetchWorkCenters]);
  
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleWorkCenterSelect = (id) => {
    // 같은 행을 다시 클릭하면 선택 해제
    setSelectedWorkCenterId(prevId => prevId === id ? null : id);
  };
  
  const handleSearch = useCallback(() => {
    setSelectedWorkCenterId(null);
    fetchWorkCenters(searchParams);
  }, [searchParams, fetchWorkCenters]);
  
  useEffect(() => {
    setIconHandlers({ onSearch: handleSearch });
    return () => setIconHandlers({ onSearch: null });
  }, [handleSearch, setIconHandlers]);

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '90vh' }}>
      {/* 1. 조회 조건 */}
      <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div>
            <label htmlFor="workCenterId">작업장 ID: </label>
            <input id="workCenterId" name="workCenterId" value={searchParams.workCenterId} onChange={handleSearchChange} style={{ border: '1px solid black' }}/>
          </div>
          <div>
            <label htmlFor="workCenterNm">작업장명: </label>
            <input id="workCenterNm" name="workCenterNm" value={searchParams.workCenterNm} onChange={handleSearchChange} style={{ border: '1px solid black' }}/>
          </div>
          <div>
            <label htmlFor="processId">공정 ID: </label>
            <input id="processId" name="processId" value={searchParams.processId} onChange={handleSearchChange} style={{ border: '1px solid black' }}/>
          </div>
          <div>
            <label htmlFor="isActive">활성 여부: </label>
            <select id="isActive" name="isActive" value={searchParams.isActive === null ? '' : searchParams.isActive} onChange={handleSearchChange} style={{ border: '1px solid black' }}>
              <option value="">전체</option>
              <option value="true">활성</option>
              <option value="false">비활성</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. 하단 그리드 영역 */}
      <div style={{ flex: 1, display: 'flex', gap: '20px', overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid #ccc' }}>
          <h3 style={{ margin: 0, padding: '10px', backgroundColor: '#f2f2f2' }}>작업장</h3>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {/* ★★★ 3. loading.workCenters -> loading으로 수정 ★★★ */}
            {loading ? <p>로딩 중...</p> : 
              <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#eee' }}><th>ID</th><th>작업장명</th><th>공정ID</th><th>활성 여부</th></tr>
                </thead>
                <tbody>
                  {workCenters.map(wc => (
                    <tr 
                      key={wc.workCenterId} 
                      onClick={() => handleWorkCenterSelect(wc.workCenterId)}  // 선택된 행의 색깔을 바꿀수 있음
                      style={{ cursor: 'pointer', backgroundColor: selectedWorkCenterId === wc.workCenterId ? '#e3f2fd' : 'transparent' }}
                    >
                      <td>{wc.workCenterId}</td>
                      <td>{wc.workCenterNm}</td>
                      <td>{wc.processId}</td>
                      <td>{wc.isActive ? '활성' : '비활성'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          </div>
        </div>
        
        <EquipmentManagement workCenterId={selectedWorkCenterId} />
      </div>
    </div>
  );
}