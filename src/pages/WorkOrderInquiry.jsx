import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/work-orders';

// LocalDateTime 형식을 "YYYY-MM-DD HH:MM"으로 바꿔주는 함수
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '-';
  return dateTimeString.replace('T', ' ').substring(0, 16);
};

export default function WorkOrderInquiry() {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 생성 모달(팝업) 창의 상태를 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 새로 생성할 작업지시의 폼 데이터를 관리
  const [newWorkOrder, setNewWorkOrder] = useState({
    processId: '', processPlanId: '', blockId: '', workCenterId: '',
    instruction: '', quantityToProduce: '', plannedStartDate: '', plannedEndDate: '',
  });
  // 검색 필터 state
  const [filters, setFilters] = useState({ status: '', workCenterId: '' });

  // 데이터를 불러오는 함수
  const fetchWorkOrders = async (currentFilters) => {
    try {
      setLoading(true);
      setError(null);
      // axios 요청에 params를 추가하여 필터 값을 전달
      const response = await axios.get(API_URL, { params: currentFilters });
      setWorkOrders(response.data);
    } catch (e)      {setError(e);}
     finally {
      setLoading(false);
    }
  };

  // 컴포넌트가 처음 로드될 때 전체 데이터를 불러옴
  useEffect(() => {
    fetchWorkOrders(filters);
  }, []);

  // 상태 변경 핸들러
  const handleStatusUpdate = async (id, newStatus) => {
    if (window.confirm(`작업지시(ID: ${id})를 '${newStatus}' 상태로 변경하시겠습니까?`)) {
        try {
            await axios.patch(`${API_URL}/${id}/status`, { newStatus });
            alert("상태가 성공적으로 변경되었습니다.");
            fetchWorkOrders(filters); // 변경 후 현재 필터로 목록 새로고침
        } catch (err) {
            alert(`상태 변경 중 오류 발생: ${err.response?.data?.message || err.message}`);
        }
    }
  };
  
  // 생성 모달 폼 핸들러
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewWorkOrder(prevState => ({ ...prevState, [name]: value }));
  };

  // 생성 모달 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const payload = {
            ...newWorkOrder,
            processPlanId: parseInt(newWorkOrder.processPlanId, 10),
            blockId: parseInt(newWorkOrder.blockId, 10),
            quantityToProduce: parseInt(newWorkOrder.quantityToProduce, 10),
            plannedStartDate: `${newWorkOrder.plannedStartDate}T09:00:00`,
            plannedEndDate: `${newWorkOrder.plannedEndDate}T18:00:00`,
        };
        await axios.post(API_URL, payload);
        alert('새로운 작업지시가 등록되었습니다.');
        setIsModalOpen(false); // 모달 닫기
        fetchWorkOrders(filters); // 생성 후 현재 필터로 목록 새로고침
    } catch (err) {
        alert(`등록 중 오류 발생: ${err.response?.data?.message || err.message}`);
    }
  };

  // 검색 필터 입력 핸들러
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // 검색 버튼 클릭 핸들러
  const handleSearch = () => {
    fetchWorkOrders(filters);
  };
  
  if (loading) return <div className="p-8 text-center">작업지시 목록을 불러오는 중입니다...</div>;
  if (error) return <div className="p-8 text-center text-red-500">에러: {error.message}</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">작업지시 조회 및 관리</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            신규 작업지시 등록
        </button>
      </div>
      
      {/* 검색 필터 UI */}
      <div className="mb-6 p-4 border rounded-lg bg-gray-50 flex items-center space-x-4">
        <select name="status" value={filters.status} onChange={handleFilterChange} className="p-2 border rounded">
          <option value="">-- 상태 전체 --</option>
          <option value="waiting">대기</option>
          <option value="in_progress">진행 중</option>
          <option value="completed">완료</option>
        </select>
        <input
          type="text"
          name="workCenterId"
          value={filters.workCenterId}
          onChange={handleFilterChange}
          placeholder="작업장 ID로 검색"
          className="p-2 border rounded"
        />
        <button onClick={handleSearch} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
          검색
        </button>
      </div>

      {/* 데이터 테이블 */}
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full leading-normal text-sm">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600 uppercase">
              <th className="py-3 px-4">지시 ID</th><th className="py-3 px-4">지시 내용</th><th className="py-3 px-4">상태</th>
              <th className="py-3 px-4">실제 시작일</th><th className="py-3 px-4">실제 종료일</th><th className="py-3 px-4">계획/생산량</th><th className="py-3 px-4">작업</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {workOrders.map((order) => (
              <tr key={order.workOrderId} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">{order.workOrderId}</td><td className="py-3 px-4">{order.instruction}</td><td className="py-3 px-4 font-semibold">{order.currentStatus}</td>
                <td className="py-3 px-4">{formatDateTime(order.actualStartDate)}</td><td className="py-3 px-4">{formatDateTime(order.actualEndDate)}</td>
                <td className="py-3 px-4">{`${order.quantityProduced} / ${order.quantityToProduce}`}</td>
                <td className="py-3 px-4">
                  {order.currentStatus === 'waiting' && (
                    <button onClick={() => handleStatusUpdate(order.workOrderId, 'in_progress')} className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
                      시작
                    </button>
                  )}
                  {order.currentStatus === 'in_progress' && (
                    <button onClick={() => handleStatusUpdate(order.workOrderId, 'completed')} className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                      종료
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {/* 생성 모달(팝업) 창 UI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">신규 작업지시 등록</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="processId" onChange={handleFormChange} placeholder="공정 ID" className="p-2 border rounded" required />
                <input type="number" name="processPlanId" onChange={handleFormChange} placeholder="공정 계획 ID" className="p-2 border rounded" required />
                <input type="number" name="blockId" onChange={handleFormChange} placeholder="블록 ID" className="p-2 border rounded" required />
                <input type="text" name="workCenterId" onChange={handleFormChange} placeholder="작업장 ID" className="p-2 border rounded" required />
                <input type="number" name="quantityToProduce" onChange={handleFormChange} placeholder="계획 수량" className="p-2 border rounded" required />
                <div/>
                <input type="date" name="plannedStartDate" onChange={handleFormChange} className="p-2 border rounded" required />
                <input type="date" name="plannedEndDate" onChange={handleFormChange} className="p-2 border rounded" required />
                <textarea name="instruction" onChange={handleFormChange} placeholder="작업 지시 내용" className="p-2 border rounded col-span-2" rows="3" required />
              </div>
              <div className="flex justify-end mt-6 space-x-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">취소</button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">저장</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}