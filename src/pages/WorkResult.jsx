// src/pages/WorkResults.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const WORK_RESULT_API_URL = "http://localhost:8082/api/work-results";

const formatDateTime = (dateTime) => {
  if (!dateTime) return '-';
  return new Date(dateTime).toLocaleString('ko-KR');
};

export default function WorkResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ workOrderId: '', employeeId: '' });

  const fetchResults = useCallback(async (currentFilters) => {
    setLoading(true);
    try {
      const response = await axios.get(WORK_RESULT_API_URL, { params: currentFilters });
      setResults(response.data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults(filters);
  }, [fetchResults]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => fetchResults(filters);

  if (loading) return <p>실적 목록을 불러오는 중입니다...</p>;
  if (error) return <p>에러 발생: {error.message}</p>;

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <input name="workOrderId" value={filters.workOrderId} onChange={handleFilterChange} placeholder="작업지시 ID" />
        <input name="employeeId" value={filters.employeeId} onChange={handleFilterChange} placeholder="작업자 ID" />
        <button onClick={handleSearch}>검색</button>
      </div>
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th>실적ID</th><th>작업지시ID</th><th>작업자</th><th>합격품</th><th>불량품</th><th>시작시간</th><th>종료시간</th><th>상태</th>
          </tr>
        </thead>
        <tbody>
          {results.map(r => (
            <tr key={r.resultId}>
              <td>{r.resultId}</td><td>{r.workOrderId}</td><td>{r.employeeId}</td><td>{r.completedQuantity}</td><td>{r.defectiveQuantity}</td>
              <td>{formatDateTime(r.startTime)}</td><td>{formatDateTime(r.endTime)}</td><td>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}