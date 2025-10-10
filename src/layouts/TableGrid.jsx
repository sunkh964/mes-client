import React from "react";

export default function TableGrid({
  columns,
  data = [],
  selectedRow,
  onRowSelect,
  onCellUpdate,
  readOnly = true,
  rowKey = "id",
  editingRowId,
  onRowDoubleClick,
  getRowClassName,
  alwaysEditable = false,
}) {
  // datetime-local input value 포맷 변환 함수
  const formatDateTimeLocal = (val) => {
    if (!val) return "";
    try {
      const date = new Date(val);

      // 로컬 시간대 기준으로 yyyy-MM-ddTHH:mm 반환
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return val;
    }
  };

  return (
    <div className="h-full shadow-md">
      <table className="min-w-full table-fixed divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="sticky top-0 z-10 bg-gray-50 px-6 py-3 text-center text-sm font-semibold text-gray-500 uppercase tracking-wider w-12">
              No.
            </th>
            {columns.map((col, i) => (
              <th
                key={i}
                className="sticky top-0 z-10 bg-gray-50 px-6 py-3 text-center text-sm font-semibold text-gray-500 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data && data.length > 0 ? (
            // ✅ 기존과 동일하게 데이터가 있을 때 행 렌더링
            data.map((row, rowIndex) => (
              <tr
                key={row[rowKey] || `new-${rowIndex}`}
                onClick={() => onRowSelect?.(row)}
                onDoubleClick={() => onRowDoubleClick?.(row)}
                className={`cursor-pointer 
                  ${getRowClassName ? getRowClassName(row) : ""} 
                  ${
                    selectedRow?.[rowKey] === row[rowKey]
                      ? "bg-blue-100"
                      : "hover:bg-gray-50"
                  }`}
              >
                <td className="px-6 py-2.5 text-sm font-medium text-gray-900">
                  {rowIndex + 1}
                </td>
                {columns.map((col) => {
                  const isEditing =
                    !readOnly &&
                    col.editable &&
                    (alwaysEditable || editingRowId === row[rowKey]);

                  return (
                    <td key={col.accessor} className="px-6 py-2.5 text-sm text-gray-700">
                      {isEditing ? (
                        col.editor === "select" ? (
                          <select
                            value={row[col.accessor] ?? ""}
                            onChange={(e) =>
                              onCellUpdate?.(rowIndex, col.accessor, e.target.value)
                            }
                            className="w-full bg-white outline-none border border-none px-2 py-1 text-sm"
                          >
                            {(col.getOptions ? col.getOptions(row) : col.options)?.map(
                              (opt) =>
                                typeof opt === "object" ? (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ) : (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                )
                            )}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={row[col.accessor] ?? ""}
                            onChange={(e) =>
                              onCellUpdate?.(rowIndex, col.accessor, e.target.value)
                            }
                            className="w-full bg-white outline-none border border-none px-2 py-1 text-sm"
                          />
                        )
                      ) : (
                        col.cell ? col.cell(row) : row[col.accessor] ?? ""
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            // ✅ 여기 수정됨: 신규행(_isNew)이 하나라도 있으면 문구 숨김
            (!data.some?.((d) => d._isNew)) && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-6 py-2.5 text-center text-sm text-gray-500"
                >
                  데이터가 없습니다.
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
