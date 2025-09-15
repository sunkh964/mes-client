// src/pages/ProcessManagement.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
// import { useIconContext } from "../utils/IconContext";
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
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      // 체크박스는 '전체' 상태를 위해 토글(true -> false -> null -> true) 시킵니다.
      setSearchParams(prev => ({
        ...prev,
        [name]: prev[name] === null ? true : (prev[name] === true ? false : null)
      }));
    } else {
      setSearchParams(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // 4. 검색 버튼 클릭 시 실행될 함수
  const handleSearch = () => {
    fetchProcesses(searchParams);
  };

  const getIsActiveLabel = (value) => {
    if (value === true) return '활성';
    if (value === false) return '비활성';
    return '전체';
  }

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '90vh' }}>
      {/* ==================== 상단: 검색 그리드 ==================== */}
      <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
        <h2>검색 조건</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div>
            <label htmlFor="processId">공정 ID: </label>
            <input
              type="text"
              id="processId"
              name="processId"
              value={searchParams.processId}
              onChange={handleSearchChange}
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
            />
          </div>
          <div>
            <label htmlFor="isActive">활성 여부: </label>
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={searchParams.isActive === true}
              onChange={handleSearchChange}
              style={{ verticalAlign: 'middle' }}
            />
             <span style={{ marginLeft: '5px', minWidth: '40px', display: 'inline-block' }}>
              {getIsActiveLabel(searchParams.isActive)}
            </span>
          </div>
          <button onClick={handleSearch}>조회</button>
        </div>
      </div>

      {/* ==================== 하단: 결과 그리드 ==================== */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <h1>공정 리스트</h1>
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