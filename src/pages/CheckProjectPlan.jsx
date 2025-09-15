import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useIconContext } from "../utils/IconContext"; // 상단 아이콘 버튼용

// TODO: 나중에 실제 생산계획 API 서버 주소로 변경해야 합니다.
// const PLAN_API_URL = "http://<다른_서버_주소>/api/project-plans";

const PLAN_API_URL = "http://localhost:8082/api/project-plans";

export default function ProductionPlanInquiry() {
  // --- 상태 관리 (State) ---
  const [plans, setPlans] = useState([]); // 조회된 생산계획 목록
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 검색 조건을 위한 상태
  const [searchParams, setSearchParams] = useState({
    planId: "",
    projectId: "",
    vesselId: "",
    startDate: "",
    endDate: "",
  });

  const { setIconHandlers } = useIconContext();

  // --- 데이터 조회 로직 ---
  const fetchPlans = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams(
        Object.entries(params).filter(([, value]) => value) // 값이 있는 파라미터만 사용
      ).toString();
      
      const fullUrl = `${PLAN_API_URL}${queryParams ? `?${queryParams}` : ''}`;
      console.log("요청 URL:", fullUrl);

      // const response = await axios.get(fullUrl);
      // setPlans(response.data);

      // --- 실제 API 연동 전까지 사용할 가짜 데이터 ---
      const MOCK_DATA = [
        { planId: 'PLAN-001', projectId: 'PJ-A', vesselId: 'V-01', startDate: '2025-09-15', endDate: '2025-10-15', progressRate: 25.5, status: 1 },
        { planId: 'PLAN-002', projectId: 'PJ-B', vesselId: 'V-02', startDate: '2025-09-20', endDate: '2025-11-20', progressRate: 0, status: 0 },
      ];
      
        setPlans(MOCK_DATA);
        setLoading(false);
      
      // --- 가짜 데이터 끝 ---

    } catch (e) {
      setError(e);
      setLoading(false);
    }
  }, []);

  // 처음 페이지 로드 시 전체 목록 조회
  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // 상단 조회 아이콘 버튼에 검색 기능 연결
  useEffect(() => {
    setIconHandlers({ onSearch: () => fetchPlans(searchParams) });
    return () => setIconHandlers({ onSearch: null });
  }, [searchParams, setIconHandlers, fetchPlans]);
  
  // --- 이벤트 핸들러 ---
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  // 진행 상태를 텍스트로 변환하는 함수
  const getStatusText = (status) => {
    switch(status) {
      case 0: return '계획';
      case 1: return '진행';
      case 2: return '완료';
      default: return '알 수 없음';
    }
  };

  // --- 렌더링 ---
  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '90vh' }}>
      {/* 1. 조회 조건 */}
      <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <label>계획 ID: </label>
            <input name="planId" value={searchParams.planId} onChange={handleSearchChange} style={{ border: '1px solid black', width: "100px" }} />
          </div>
          <div>
            <label>프로젝트 ID: </label>
            <input name="projectId" value={searchParams.projectId} onChange={handleSearchChange} style={{ border: '1px solid black', width: "100px" }} />
          </div>
          <div>
            <label>선박 ID: </label>
            <input name="vesselId" value={searchParams.vesselId} onChange={handleSearchChange} style={{ border: '1px solid black', width: "100px" }} />
          </div>
          <div>
            <label>계획 기간: </label>
            <input type="date" name="startDate" value={searchParams.startDate} onChange={handleSearchChange} style={{ border: '1px solid black', width: "150px" }} />
            <span> ~ </span>
            <input type="date" name="endDate" value={searchParams.endDate} onChange={handleSearchChange} style={{ border: '1px solid black', width: "150px" }} />
          </div>
        </div>
      </div>

      {/* 2. 하단 결과 그리드 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {loading ? <p>로딩 중...</p> : error ? <p>에러 발생: {error.message}</p> :
          <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f2f2f2' }}>
              <tr>
                <th>계획 ID</th>
                <th>프로젝트 ID</th>
                <th>선박 ID</th>
                <th>시작일</th>
                <th>종료일</th>
                <th>진행률</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.planId}>
                  <td>{plan.planId}</td>
                  <td>{plan.projectId}</td>
                  <td>{plan.vesselId}</td>
                  <td>{plan.startDate}</td>
                  <td>{plan.endDate}</td>
                  <td>{plan.progressRate}%</td>
                  <td>{getStatusText(plan.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>
    </div>
  );
}