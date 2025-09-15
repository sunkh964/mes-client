// src/pages/ProcessManagement.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useIconContext } from "../utils/IconContext";
import useKeyboard from "../hooks/useKeyboard";

const API_URL = "http://localhost:8082/api/processes";


export default function ProcessManagement() {
  
  const [processes, setProcesses] = useState([]);  // 공정 목록을 저장할 state (초기값은 빈 배열)  
  const [loading, setLoading] = useState(true);    // 데이터를 불러오는 중인지 알려주는 loading state  
  const [error, setError] = useState(null);        // 3. 에러가 발생했는지 알려주는 error state

  // 검색 조건을 저장할 state
  const [searchParams, setSearchParams] = useState({
    processId: '',
    processNm: '',
    isActive: null, // 체크박스는 true/false/null 세 가지 상태를 가질 수 있습니다.
  });

   // 페이지가 처음 로드될 때 전체 목록을 조회합니다.
  useEffect(() => {
    fetchProcesses();
  }, []);

  // 데이터를 조건에 맞게 가져오는 함수
  const fetchProcesses = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams(
        Object.entries(params).filter(([key, value]) => {
          if (key === 'isActive') return value !== null; // isActive는 null이 아닐 때만 포함
          return value !== ''; // 나머지는 빈 문자열이 아닐 때만 포함
        })
      ).toString();
      
      const fullUrl = `${API_URL}${queryParams ? `?${queryParams}` : ''}`;
      const response = await axios.get(fullUrl);
      setProcesses(response.data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  // 3. 검색 입력창 값이 바뀔 때마다 searchParams state를 업데이트하는 함수
  const handleSearchChange = (e) => {
  const { name, value } = e.target;
  setSearchParams(prev => ({ ...prev, [name]: value }));
};
  
  // 4. 검색 버튼 클릭 시 실행될 함수
  const handleSearch = () => {
    fetchProcesses(searchParams);
  };

  // 5. Context에서 핸들러 등록 함수 가져오기
  const { setIconHandlers } = useIconContext(); 

  // 6. onSearch 아이콘 버튼에 handleSearch 함수를 연결합니다.
  useEffect(() => {
    setIconHandlers({ onSearch: handleSearch });
    
    // 컴포넌트가 사라질 때 등록된 핸들러를 정리(clean-up)합니다.
    return () => {
      setIconHandlers({ onSearch: null });
    };
  }, [searchParams]); // searchParams가 바뀔 때마다 최신 상태를 반영한 함수를 다시 등록

  const getIsActiveLabel = (value) => {
    if (value === true) return '활성';
    if (value === false) return '비활성';
    return '전체';
  }

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '90vh' }}>
      {/* ==================== 상단: 검색 그리드 ==================== */}
      <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div>
            <label htmlFor="processId">공정 ID: </label>
            <input
              type="text"
              id="processId"
              name="processId"
              value={searchParams.processId}
              onChange={handleSearchChange}
              style={{ border: '1px solid black' }}
            />
          </div>
          <div>
            <label htmlFor="processNm">공정명: </label>
            <input
              type="text"
              id="processNm"
              name="processNm"
              value={searchParams.processNm}
              onChange={handleSearchChange}
              style={{ border: '1px solid black' }} 
            />
          </div>
          <div>
          <label htmlFor="isActive">활성 여부: </label>
          <select
            id="isActive"
            name="isActive"
            value={searchParams.isActive === null ? '' : searchParams.isActive} // null일 경우 빈 문자열('') 값으로 매핑
            onChange={handleSearchChange}
            style={{ border: '1px solid black', marginLeft: '5px' }}
          >
            <option value="">전체</option>
            <option value="true">활성</option>
            <option value="false">비활성</option>
          </select>
        </div>
        </div>
      </div>

      {/* ==================== 하단: 결과 그리드 ==================== */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <div>데이터를 불러오는 중입니다...</div>
        ) : error ? (
          <div>에러가 발생했습니다: {error.message}</div>
        ) : (
          <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ padding: '8px' }}>공정 ID</th>
                <th style={{ padding: '8px' }}>공정명</th>
                <th style={{ padding: '8px' }}>공정 정보</th>
                <th style={{ padding: '8px' }}>활성 여부</th>
              </tr>
            </thead>
            <tbody>
              {processes.map((process) => (
                <tr key={process.processId}>
                  <td style={{ padding: '8px' }}>{process.processId}</td>
                  <td style={{ padding: '8px' }}>{process.processNm}</td>
                  <td style={{ padding: '8px' }}>{process.processInfo}</td>
                  <td style={{ padding: '8px' }}>{process.isActive ? "활성" : "비활성"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}