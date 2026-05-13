export default function Table({ columns = [], rows = [] }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-brand-dark/10 bg-white/85">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-brand-dark">
          <thead className="bg-brand-secondary/25 text-xs uppercase tracking-[0.18em] text-brand-dark/65">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-4 font-semibold">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id ?? index} className="border-t border-brand-dark/6">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-4 text-brand-dark/80">
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}