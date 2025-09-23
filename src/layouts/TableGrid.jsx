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
  return (
    <div className="h-full shadow-md">
      <table className="min-w-full divide-y divide-gray-200">
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
          {data.length === 0 ? (
            <tr>
                <td
                    colSpan={columns.length + 1}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                >
                    데이터가 없습니다.
                </td>
                </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row[rowKey] || rowIndex}
                onClick={() => onRowSelect?.(row)}
                onDoubleClick={() => onRowDoubleClick?.(row)}
                className={`cursor-pointer 
                    ${getRowClassName ? getRowClassName(row) : ""} 
                    ${selectedRow?.[rowKey] === row[rowKey] ? "bg-blue-100" : "hover:bg-gray-50"}
                `}
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
                    <td
                        key={col.accessor}
                        className="px-6 py-2.5 text-sm text-gray-700"
                        >
                        {isEditing ? (
                        col.editor === "select" ? (
                            <select
                            value={row[col.accessor] ?? ""}
                            onChange={(e) =>
                                onCellUpdate?.(rowIndex, col.accessor, e.target.value)
                            }
                            className="w-full bg-white outline-none border border-none px-2 py-1 text-sm"
                            >
                            {col.options.map((opt) => (
                                <option key={opt} value={opt}>
                                {opt}
                                </option>
                            ))}
                            </select>
                        ) : col.editor === "number" ? (
                            <input
                            type="text"
                            value={row[col.accessor] ?? ""}
                            onChange={(e) => onCellUpdate?.(rowIndex, col.accessor, e.target.value)}
                            className="w-full bg-white outline-none border border-none px-2 py-1 text-sm"
                            />
                        ) : (
                            <input
                            type="number"
                            value={row[col.accessor] ?? 0}
                            min={0}
                            onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                onCellUpdate?.(rowIndex, col.accessor, isNaN(val) ? 0 : Math.max(0, val));
                            }}
                            className="w-full bg-white outline-none border border-none px-2 py-1 text-sm text-right"
                            />
                        )
                        ) : (
                            // cell 프로퍼티 우선 적용
                            col.cell ? col.cell(row) : row[col.accessor] ?? ""
                        )}
                        </td>

                    );
                })}
                </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
