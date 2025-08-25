import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/work-orders';

// 날짜/시간 형식을 "YYYY-MM-DD HH:MM"으로 바꿔주는 함수
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '-';
  return dateTimeString.replace('T', ' ').substring(0, 16);
};
// 날짜 형식을 "YYYY-MM-DD"로 바꿔주는 함수
const formatDateToISO = (date) => {
    return date ? new Date(date).toISOString().substring(0, 10) : '';
};


export default function WorkOrderInquiry() {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✨ 모달(팝업) 창의 상태를 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  // ✨ 새로 생성할 작업지시의 폼 데이터를 관리
  const [newWorkOrder, setNewWorkOrder] = useState({
    processId: '',
    processPlanId: '',
    blockId: '',
    workCenterId: '',
    instruction: '',
    quantityToProduce: '',
    plannedStartDate: '',
    plannedEndDate: '',
  });

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setWorkOrders(response.data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    if (window.confirm(`작업지시(ID: ${id})를 '${newStatus}' 상태로 변경하시겠습니까?`)) {
        try {
            await axios.patch(`${API_URL}/${id}/status`, { newStatus });
            alert("상태가 성공적으로 변경되었습니다.");
            fetchWorkOrders();
        } catch (err) {
            alert(`상태 변경 중 오류 발생: ${err.response?.data?.message || err.message}`);
        }
    }
  };
  
  // ✨ 모달 폼의 내용이 바뀔 때마다 newWorkOrder state를 업데이트
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewWorkOrder(prevState => ({ ...prevState, [name]: value }));
  };

  // ✨ 모달 폼을 제출(저장)할 때 실행될 함수
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const payload = {
            ...newWorkOrder,
            processPlanId: parseInt(newWorkOrder.processPlanId, 10),
            blockId: parseInt(newWorkOrder.blockId, 10),
            quantityToProduce: parseInt(newWorkOrder.quantityToProduce, 10),
            // 날짜와 시간을 'YYYY-MM-DDTHH:MM' 형식으로 조합
            plannedStartDate: `${newWorkOrder.plannedStartDate}T09:00:00`,
            plannedEndDate: `${newWorkOrder.plannedEndDate}T18:00:00`,
        };
        await axios.post(API_URL, payload);
        alert('새로운 작업지시가 등록되었습니다.');
        setIsModalOpen(false); // 모달 닫기
        fetchWorkOrders(); // 목록 새로고침
    } catch (err) {
        alert(`등록 중 오류 발생: ${err.response?.data?.message || err.message}`);
    }
  };
  
  if (loading) return <div className="p-8 text-center">작업지시 목록을 불러오는 중입니다...</div>;
  if (error) return <div className="p-8 text-center text-red-500">에러: {error.message}</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">작업지시 조회 및 관리</h1>
        {/* ✨ '등록' 버튼 추가 */}
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            신규 작업지시 등록
        </button>
      </div>

      {/* ... 기존 테이블 코드 ... */}
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full leading-normal text-sm">
        {/* ... table thead, tbody ... */}
        </table>
      </div>


      {/* ✨ 모달(팝업) 창 UI */}
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
                <div/> {/* Grid 채우기용 빈 div */}
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