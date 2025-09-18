import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// 요청 API 주소
const BOM_PROXY_API_URL = "http://localhost:8083/api/proxy/boms";

export default function BomInquiry() {
  // --- 상태 관리 ---
  const [boms, setBoms] = useState([]); // 조회된 BOM 목록
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 데이터 조회 로직 ---
  const fetchBoms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(BOM_PROXY_API_URL);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // 컴포넌트가 처음 로드될 때 BOM 데이터를 가져옵니다.
  useEffect(() => {
    fetchBoms();
  }, [fetchBoms]);

  
  // --- 렌더링 ---
  if (loading) return <div style={{padding: '20px'}}>BOM 정보를 불러오는 중입니다...</div>;
  if (error) return <div style={{padding: '20px'}}>에러가 발생했습니다: {error.message}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>BOM 정보 조회 (from ERP)</h2>
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
        <thead style={{ backgroundColor: '#f2f2f2' }}>
          <tr>
            {/* TODO: ERP에서 받은 실제 BOM 데이터의 필드명에 맞게 헤더를 수정하세요. */}
            <th>BOM ID</th>
            <th>자재 ID</th>
            <th>자재명</th>
            <th>수량</th>
            <th>단위</th>
          </tr>
        </thead>
        <tbody>
          {boms.map((bomItem, index) => (
            <tr key={index}>
              {/* TODO: ERP에서 받은 실제 BOM 데이터의 필드명에 맞게 셀을 수정하세요. */}
              <td>{bomItem.bomId}</td>
              <td>{bomItem.materialId}</td>
              <td>{bomItem.materialName}</td>
              <td>{bomItem.quantity}</td>
              <td>{bomItem.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}