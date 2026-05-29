export function MetricCard({ title, value, unit = '', color, dateRange }) {
  return (
    <div style={{
      padding: '8px 12px',
      backgroundColor: '#f8f9fa',
      borderLeft: `4px solid ${color}`,
      borderRadius: '6px',
      minHeight: '70px',
    }}>
      <p style={{ fontSize: '0.7rem', color: '#6c757d', margin: '0 0 2px' }}>{title}</p>
      <p style={{ color, fontWeight: 700, fontSize: '1.1rem', margin: '0' }}>
        ₱{value}{unit}
      </p>
      <p style={{ fontSize: '0.6rem', color: '#999', margin: '2px 0 0' }}>{dateRange}</p>
    </div>
  )
}
