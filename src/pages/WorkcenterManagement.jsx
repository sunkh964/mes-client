import React, { useState, useEffect } from "react";
import axios from "axios";
import { useIconContext } from "../utils/IconContext"; // 상단 아이콘 버튼 연동

// 작업장 API 주소
const WORK_CENTER_API_URL = "http://localhost:8082/api/work-centers";

// 설비 목록 가짜(mock) 데이터
const MOCK_EQUIPMENT_DATA = {
  WC01: [ { id: 'EQ001', name: '프레스 #1' }, { id: 'EQ002', name: '프레스 #2' } ],
  WC02: [ { id: 'EQ003', name: '용접 로봇 A' } ],
  WC03: [],
};

export default function WorkCenterManagement() {
  // --- 상태 관리 (State) ---
  const [workCenters, setWorkCenters] = useState([]); // 왼쪽 그리드 (작업장 목록)
  const [equipment, setEquipment] = useState([]);     // 오른쪽 그리드 (설비 목록)
  const [selectedWorkCenterId, setSelectedWorkCenterId] = useState(null); // 선택된 작업장 ID
  const [searchParams, setSearchParams] = useState({
    workCenterId: "",
    workCenterNm: "",
    isActive: null,
    processId: "",
  });
  const [loading, setLoading] = useState({ workCenters: true, equipment: false });
  const [error, setError] = useState(null);
  
  const { setIconHandlers } = useIconContext();

  // --- 데이터 조회 로직 ---

  // 처음 로드될 때 작업장 목록을 가져옵니다.
  useEffect(() => {
    fetchWorkCenters();
  }, []);

  // 선택된 작업장이 바뀌면 해당 설비 목록을 가져옵니다.
  useEffect(() => {
    if (selectedWorkCenterId) {
      fetchEquipment(selectedWorkCenterId);
    } else {
      setEquipment([]);
    }
  }, [selectedWorkCenterId]);

  // 상단 '조회' 아이콘 버튼에 검색 기능을 연결합니다.
  useEffect(() => {
    const handleSearch = () => {
      setSelectedWorkCenterId(null);
      fetchWorkCenters(searchParams);
    };
    setIconHandlers({ onSearch: handleSearch });
    return () => setIconHandlers({ onSearch: null });
  }, [searchParams, setIconHandlers]);

  // 백엔드에서 작업장 목록을 조회하는 함수
  const fetchWorkCenters = async (params = {}) => {
    setLoading(prev => ({ ...prev, workCenters: true }));
    setError(null);
    try {
      const queryParams = new URLSearchParams(
        Object.entries(params).filter(([, value]) => value !== '' && value !== null)
      ).toString();
      const fullUrl = `${WORK_CENTER_API_URL}${queryParams ? `?${queryParams}` : ''}`;
      const response = await axios.get(fullUrl);
      setWorkCenters(response.data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(prev => ({ ...prev, workCenters: false }));
    }
  };
  
  // 설비 목록을 조회하는 함수 (현재는 가짜 데이터)
  const fetchEquipment = (workCenterId) => {
    setLoading(prev => ({ ...prev, equipment: true }));
    setTimeout(() => {
      setEquipment(MOCK_EQUIPMENT_DATA[workCenterId] || []);
      setLoading(prev => ({ ...prev, equipment: false }));
    }, 500);
  };

  // --- 이벤트 핸들러 ---
  
  // 검색 조건 입력 시 상태 업데이트
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };
  
  // 작업장 그리드의 행 클릭 시
  const handleWorkCenterSelect = (id) => {
    setSelectedWorkCenterId(id);
  };

  // --- 렌더링 ---
  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '90vh' }}>
      {/* 1. 조회 조건 */}
      <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          
          <div>
            <label htmlFor="workCenterId">작업장 ID: </label>
            <input 
              id="workCenterId" 
              name="workCenterId" 
              value={searchParams.workCenterId} 
              onChange={handleSearchChange} 
              style={{ border: '1px solid black' }}
            />
          </div>

          <div>
            <label htmlFor="workCenterNm">작업장명: </label>
            <input 
              id="workCenterNm" 
              name="workCenterNm" 
              value={searchParams.workCenterNm} 
              onChange={handleSearchChange} 
              style={{ border: '1px solid black' }}
            />
          </div>

          <div>
            <label htmlFor="processId">공정 ID: </label>
            <input 
              id="processId" 
              name="processId" 
              value={searchParams.processId} 
              onChange={handleSearchChange} 
              style={{ border: '1px solid black' }}
            />
          </div>
          
          <div>
            <label htmlFor="isActive">활성 여부: </label>
            <select 
              id="isActive" 
              name="isActive" 
              value={searchParams.isActive === null ? '' : searchParams.isActive} 
              onChange={handleSearchChange} 
              style={{ border: '1px solid black' }}
            >
              <option value="">전체</option>
              <option value="true">활성</option>
              <option value="false">비활성</option>
            </select>
          </div>

        </div>
      </div>

      {/* 2. 하단 그리드 영역 */}
      <div style={{ flex: 1, display: 'flex', gap: '20px', overflow: 'hidden' }}>
        
        {/* 2-1. 작업장 그리드 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid #ccc' }}>
          <h3 style={{ margin: 0, padding: '10px', backgroundColor: '#f2f2f2' }}>작업장</h3>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading.workCenters ? <p>로딩 중...</p> : 
              <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#eee' }}><th>ID</th><th>작업장명</th><th>공정ID</th></tr>
                </thead>
                <tbody>
                  {workCenters.map(wc => (
                    <tr 
                      key={wc.workCenterId} 
                      onClick={() => handleWorkCenterSelect(wc.workCenterId)}
                      style={{ cursor: 'pointer', backgroundColor: selectedWorkCenterId === wc.workCenterId ? '#e3f2fd' : 'transparent' }}
                    >
                      <td>{wc.workCenterId}</td>
                      <td>{wc.workCenterNm}</td>
                      <td>{wc.processId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          </div>
        </div>

        {/* 2-2. 설비 그리드 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid #ccc' }}>
          <h3 style={{ margin: 0, padding: '10px', backgroundColor: '#f2f2f2' }}>
            {selectedWorkCenterId ? `${selectedWorkCenterId} 관련 설비` : '설비 (작업장을 선택하세요)'}
          </h3>
          <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading.equipment ? <p>로딩 중...</p> : 
            <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#eee' }}><th>설비ID</th><th>설비명</th></tr>
              </thead>
              <tbody>
                {equipment.map(eq => (
                  <tr key={eq.id}>
                    <td>{eq.id}</td>
                    <td>{eq.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
          </div>
        </div>
      </div>
    </div>
  );
}