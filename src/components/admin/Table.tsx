export interface DataColumn<T extends Record<string, unknown> = Record<string, unknown>> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface DataTableProps<T extends Record<string, unknown>> {
  columns: DataColumn<T>[];
  data: T[];
  rowActions?: (row: T) => React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  rowActions,
  emptyTitle = "Data kosong",
  emptyDescription = "Tidak ada data yang tersedia.",
  className = "",
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className={`bg-black/10 border-brutal shadow-hard p-8 ${className}`}>
        <h3 className="font-grotesk font-bold text-black mb-2">{emptyTitle}</h3>
        <p className="text-gray-500 text-sm">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto bg-black/10 border-brutal shadow-hard ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-200 border-b-4 border-black">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-xs font-mono font-bold text-black uppercase tracking-wider">
                {col.label}
              </th>
            ))}
            {rowActions && <th className="px-4 py-3 text-xs font-mono font-bold text-black uppercase tracking-wider">Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={String(row.id ?? row[columns[0]?.key ?? "id"])} className="border-b border-gray-200 hover:bg-gray-100/50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm font-mono text-black">
                  {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "-")}
                </td>
              ))}
              {rowActions && <td className="px-4 py-3">{rowActions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
