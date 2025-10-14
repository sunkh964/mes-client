import { useEffect, useState } from "react";
import axios from "axios";
import { useIconContext } from "../utils/IconContext";
import TableGrid from "../layouts/TableGrid";

const API_URL = "http://localhost:8082/api/shipments";

export default function Shipment() {
  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);

  // 검색 조건 초기값
  const initialSearchParams = {
    salesOrderId: "",
    customerId: "",
    vesselId: "",
    plannedShipDateFrom: "",
    plannedShipDateTo: "",
    status: "",
  };
  const [searchParams, setSearchParams] = useState(initialSearchParams);

  const { setIconHandlers } = useIconContext();

  // 전체 데이터 조회
  const fetchShipments = async () => {
    try {
      const res = await axios.get(`${API_URL}`);
      setShipments(res.data);
      setSelectedShipment(res.data.length > 0 ? res.data[0] : null);
    } catch (e) {
      console.error("출하 데이터 조회 실패:", e);
      setShipments([]);
      setSelectedShipment(null);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  // 검색 실행
  const handleSearch = async () => {
    try {
      const res = await axios.get(`${API_URL}/search`, { params: searchParams });
      setShipments(res.data);
      setSelectedShipment(res.data.length > 0 ? res.data[0] : null);
    } catch (e) {
      console.error("출하 검색 실패:", e);
    }
  };

  // 날짜 포맷
  const formatDateTime = (dateStr, withTime = false) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);

    const pad = (n) => (n < 10 ? "0" + n : n);

    const yyyy = date.getFullYear();
    const MM = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());

    if (withTime) {
      const hh = pad(date.getHours());
      const mm = pad(date.getMinutes());
      return `${yyyy}-${MM}-${dd} ${hh}:${mm}`; // YYYY-MM-DD HH:mm
    } else {
      return `${yyyy}-${MM}-${dd}`; // YYYY-MM-DD
    }
  };

    // 행 추가
    const handleAddRow = () => {
      const today = new Date().toISOString().slice(0, 10); // yyyy-MM-dd
      const newRow = {
        shipmentId: null, // PK 없음 → 신규
        salesOrderId: "",
        customerId: "",
        vesselId: "",
        plannedShipDate: today + "T00:00:00",
        actualShipDate: null,
        status: 0,
        createdBy: "",
        approvedDate: null,
        approvedBy: "",
        remark: "",
        _isNew: true, 
      };
      setShipments((prev) => [...prev, newRow]);
      setSelectedShipment(newRow);
    };


    // 저장
    const handleSave = async () => {
      if (!selectedShipment) {
        alert("저장할 출하를 선택하세요.");
        return;
      }
      if (!selectedShipment.customerId) {
        alert("고객번호는 반드시 입력해야 합니다.");
        return;
      }

      try {
        console.log("데이터:", selectedShipment);
        if (selectedShipment._isNew || !selectedShipment.shipmentId) {
          // 신규 등록
          await axios.post(API_URL, selectedShipment);
          alert("등록 완료");
        } else {
          // 수정
          await axios.put(`${API_URL}/${selectedShipment.shipmentId}`, selectedShipment);
          alert("수정 완료");
        }
        await fetchShipments();
      } catch (err) {
        console.error("저장 실패:", err);
        alert("저장 실패: " + (err.response?.data?.message || err.message));
      }
    };

    // 삭제
    const handleDelete = async () => {
      if (!selectedShipment?.shipmentId) {
        alert("삭제할 출하를 선택하세요.");
        return;
      }
      if (!window.confirm(`정말 삭제하시겠습니까? (${selectedShipment.shipmentId})`)) return;

      try {
        await axios.delete(`${API_URL}/${selectedShipment.shipmentId}`);
        alert("삭제 완료!");
        await fetchShipments();
      } catch (err) {
        console.error("삭제 실패:", err);
        alert("삭제 실패: " + (err.response?.data?.message || err.message));
      }
    };

     // 상세에서 수정
    const updateShipmentField = (field, value) => {
      setSelectedShipment((prev) => {
        if (!prev) return prev;
        const cleanValue =
          value === "-" || value === "" ? null : value;
        const updated = { ...prev, [field]: cleanValue };
        setShipments((prevList) =>
          prevList.map((s) => (s.shipmentId === prev.shipmentId ? updated : s))
        );
        return updated;
      });
    };

    const renderStatus = (status) => {
      switch (status) {
        case 0: return "계획";
        case 1: return "출하";
        case 2: return "인도완료";
        case 3: return "취소";
        default: return "-";
      }
    };
    
    // ================= 아이콘 핸들러 등록 =================
    useEffect(() => {
      setIconHandlers({
        onSearch: handleSearch,
        onNew: handleAddRow,
        onSave: handleSave,
        onDelete: handleDelete,
      });
      return () =>
        setIconHandlers({
          onSearch: null,
          onNew: null,
          onSave: null,
          onDelete: null,
        });
    }, [searchParams, shipments, selectedShipment]);

    // 검색조건 변경
    const handleSearchChange = (e) => {
      const { name, value } = e.target;
      setSearchParams((prev) => ({ ...prev, [name]: value }));
    };

    // 초기화
    const handleReset = () => {
      setSearchParams(initialSearchParams);
      fetchShipments();
    };

    // ================= TableGrid 컬럼 =================
    const shipmentColumns = [
      { header: "출하번호", accessor: "shipmentId" },
      { header: "수주번호", accessor: "salesOrderId" },
      { header: "고객번호", accessor: "customerId" },
      { header: "선박코드", accessor: "vesselId" },
      {
        header: "출하예정일",
        accessor: "plannedShipDate",
        cell: (row) => row.plannedShipDate ? formatDateTime(row.plannedShipDate, true) : "-"
      },
      { header: "상태", accessor: "status", cell: (row) => renderStatus(row.status) },
      {
        header: "승인여부",
        accessor: "approvedDate",
        cell: (row) => row.approvedDate ? formatDateTime(row.approvedDate, true) : "-"
      },
    ];
  
  return (
    <div className="mb-2.5 p-5">
      {/* ==================== 상단 검색 ==================== */}
      <div className="border border-gray-300 px-3 py-5 mb-5">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">수주번호:</label>
            <input
              type="text"
              name="salesOrderId"
              value={searchParams.salesOrderId}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm w-32"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">고객번호:</label>
            <input
              type="text"
              name="customerId"
              value={searchParams.customerId}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm w-32"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">배번호:</label>
            <input
              type="text"
              name="vesselId"
              value={searchParams.vesselId}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm w-32"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">출하예정일(From):</label>
            <input
              type="date"
              name="plannedShipDateFrom"
              value={searchParams.plannedShipDateFrom}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">출하예정일(To):</label>
            <input
              type="date"
              name="plannedShipDateTo"
              value={searchParams.plannedShipDateTo}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">상태:</label>
            <select
              name="status"
              value={searchParams.status}
              onChange={handleSearchChange}
              className="border px-2 py-1 text-sm w-32"
            >
              <option value="">전체</option>
              <option value="0">준비</option>
              <option value="1">출하</option>
              <option value="2">인도완료</option>
              <option value="3">취소</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="ml-auto px-3 py-1 border bg-slate-500 text-white text-sm hover:bg-slate-600"
          >
            초기화
          </button>
        </div>
      </div>

      {/* ==================== 출하 목록 ==================== */}
      <h2 className="mb-2 text-lg font-semibold">출하 목록</h2>
      <div className="max-h-[300px] overflow-y-auto border border-gray-300 mb-5">
        <TableGrid
          columns={shipmentColumns}
          data={shipments}
          rowKey="shipmentId"
          selectedRow={selectedShipment}
          onRowSelect={setSelectedShipment}
        />
      </div>

      {/* ==================== 출하 상세 ==================== */}
      <h3 className="text-lg font-semibold mb-2">출하 상세</h3>
      {selectedShipment ? (
        <div className="border border-gray-300 rounded overflow-hidden p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="font-semibold block mb-1">출하번호</label>
              <input
                type="text"
                placeholder="SH-270520-01"
                value={selectedShipment.shipmentId || ""}
                readOnly={!selectedShipment._isNew}  // 신규일 때만 수정 가능
                onChange={(e) => updateShipmentField("shipmentId", e.target.value)}
                className={`border px-2 py-1 w-full ${selectedShipment._isNew ? "" : "bg-gray-200"}`}
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">상태</label>
              <select
                value={selectedShipment.status ?? 0}
                onChange={(e) => updateShipmentField("status", Number(e.target.value))}
                className="border px-2 py-1 w-full"
              >
                <option value={0}>준비</option>
                <option value={1}>출하</option>
                <option value={2}>인도완료</option>
                <option value={3}>취소</option>
              </select>
            </div>
            <div>
              <label className="font-semibold block mb-1">수주번호</label>
              <input
                type="text"
                placeholder="SO-250711-01"
                value={selectedShipment.salesOrderId || ""}
                onChange={(e) => updateShipmentField("salesOrderId", e.target.value)}
                className="border px-2 py-1 w-full"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">고객번호</label>
              <input
                type="text"
                placeholder="CUSTUS001"
                value={selectedShipment.customerId || ""}
                onChange={(e) => updateShipmentField("customerId", e.target.value)}
                className="border px-2 py-1 w-full"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">선박코드</label>
              <input
                type="text"
                placeholder="BC-US01-01"
                value={selectedShipment.vesselId || ""}
                onChange={(e) => updateShipmentField("vesselId", e.target.value)}
                className="border px-2 py-1 w-full"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">출하예정일</label>
              <div className="flex gap-2">
              {/* 날짜 */}
              <input
                type="date"
                value={selectedShipment.plannedShipDate ? selectedShipment.plannedShipDate.slice(0, 10) : ""}
                onChange={(e) => {
                  const datePart = e.target.value;
                  const timePart = selectedShipment.plannedShipDate
                    ? selectedShipment.plannedShipDate.slice(11, 19) // "HH:mm:ss"
                    : "00:00:00";
                  updateShipmentField("plannedShipDate", `${datePart}T${timePart}`);
                }}
                className="border px-2 py-1 w-1/2"
              />

              {/* 시간 */}
              <input
                type="time"
                value={selectedShipment.plannedShipDate ? selectedShipment.plannedShipDate.slice(11, 16) : ""}
                onChange={(e) => {
                  const timePart = e.target.value + ":00"; // HH:mm → HH:mm:ss
                  const datePart = selectedShipment.plannedShipDate
                    ? selectedShipment.plannedShipDate.slice(0, 10)
                    : new Date().toISOString().slice(0, 10);
                  updateShipmentField("plannedShipDate", `${datePart}T${timePart}`);
                }}
                className="border px-2 py-1 w-1/2"
              />
            </div>
            </div>
            <div className="col-span-2">
              <label className="font-semibold block mb-1">비고</label>
              <textarea
                value={selectedShipment.remark || ""}
                onChange={(e) => updateShipmentField("remark", e.target.value)}
                className="border px-2 py-1 w-full"
              />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm">출하를 선택하세요.</p>
      )}

    </div>
  );
}
