// src/pages/WorkResults.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useIconContext } from '../utils/IconContext';
import axios from 'axios';
import TableGrid from '../layouts/TableGrid';

const WORK_RESULT_API_URL = "http://localhost:8082/api/work-results";

// 날짜 포맷팅 함수
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-';
  return new Date(dateTime).toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  });
};

export default function WorkResults() {
  // --- 1. 상태(State) 정의 ---
  // 이 컴포넌트에서 사용하는 모든 데이터를 상태로 관리합니다.
  const [results, setResults] = useState([]);         // 조회된 실적 목록을 담을 배열
  const [loading, setLoading] = useState(true);        // 데이터 로딩 상태 (true/false)
  const [error, setError] = useState(null);            // 에러 정보
  const [filters, setFilters] = useState({ workOrderId: '', employeeId: '', status: '' }); // 검색 필터 값

  const { setIconHandlers } = useIconContext(); // 상단 아이콘 버튼과 연동하기 위한 함수

  // --- 2. 데이터 조회 함수 ---
  // 백엔드 API로부터 작업 실적 데이터를 가져오는 함수입니다.
  // useCallback으로 감싸서 불필요한 재생성을 방지합니다.
  const fetchResults = useCallback(async (currentFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      // 값이 있는 필터만 골라서 쿼리 파라미터로 만듭니다.
      // 예: { workOrderId: '1', employeeId: '' } -> ?workOrderId=1
      const params = Object.fromEntries(
        Object.entries(currentFilters).filter(([_, value]) => value !== '' && value !== null)
      );
      const response = await axios.get(WORK_RESULT_API_URL, { params });
      setResults(response.data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- 3. 이벤트 핸들러 ---
  // 사용자의 입력이나 클릭에 반응하는 함수들입니다.

  // 검색창의 내용이 바뀔 때마다 filters 상태를 업데이트합니다.
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // '검색' 아이콘 클릭 시 실행될 함수입니다. 현재 filters 상태값으로 데이터를 조회합니다.
  const handleSearch = useCallback(() => { // 무한 루프를 방지하기 위해 useCallback으로 감싸줌.
    fetchResults(filters);
  }, [filters, fetchResults]);


  // --- 4. 사이드 이펙트 (Side Effects) ---
  // 렌더링 후 특정 작업을 수행해야 할 때 사용합니다. (주로 데이터 fetching, 아이콘 버튼 연동)

  // 컴포넌트가 처음 마운트될 때, 전체 실적 목록을 가져옵니다.
  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // 상단 아이콘 버튼에 이 컴포넌트의 검색 기능을 연결합니다.
  useEffect(() => {
    setIconHandlers({ onSearch: handleSearch });
    return () => { // 컴포넌트가 사라질 때 연결을 해제합니다.
      setIconHandlers({ onSearch: null });
    };
  }, [handleSearch, setIconHandlers]);

  
  // ================= 컬럼 정의 =================
  const columns = [
    { header: "실적ID", accessor: "resultId" },
    { header: "작업지시ID", accessor: "workOrderId" },
    { header: "작업자", accessor: "employeeId" },
    { header: "합격품", accessor: "completedQuantity" },
    { header: "불량품", accessor: "defectiveQuantity" },
    { header: "시작시간", accessor: "startTime", render: (val) => formatDateTime(val) },
    { header: "종료시간", accessor: "endTime", render: (val) => formatDateTime(val) },
    { header: "상태", accessor: "status" },
    { header: "비고", accessor: "remark" },
  ];

  // --- 5. 렌더링 ---
  // 계산된 상태값들을 바탕으로 실제 화면(UI)을 그립니다.

  if (loading) return <p>실적 목록을 불러오는 중입니다...</p>;
  if (error) return <p>에러 발생: {error.message}</p>;

  return (
    <div>
      {/* 검색 필터 UI */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px'}}>
        <label>작업지시 ID</label>
        <input type='text' name="workOrderId" value={filters.workOrderId} onChange={handleFilterChange}style={{  border: '1px solid black', padding: '4px' }}/>
        <label>작업자 ID</label>
        <input type='text' name="employeeId" value={filters.employeeId} onChange={handleFilterChange} style={{ border: '1px solid black', padding: '4px' }}/>
        <label style={{ width: '100px', fontWeight: 'bold' }}>상태:</label>
        
        <select 
          name="status" 
          value={filters.status} 
          onChange={handleFilterChange}
          style={{ border: '1px solid black', padding: '4px' }}>
            <option value="">전체</option>
            <option value="in_progress">진행 중</option>
            <option value="completed">완료</option>
            <option value="paused">일시정지</option>
        </select>
        
      </div>

      {/* 결과 테이블 UI */}
      <TableGrid
        columns={columns}
        data={results}
        rowKey="resultId"
        readOnly={true} // 조회 전용
      />
    </div>
  );
}