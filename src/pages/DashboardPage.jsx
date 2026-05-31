import { useEffect, useState } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts'
import { useDashboard } from '../hooks/useDashboard'
import { MetricCard }   from '../components/MetricCard'
import { api }          from '../api'
import { format }       from 'date-fns'

const fmt = (n, dec = 2) =>
  n == null ? '—' : Number(n).toLocaleString('en-PH', { minimumFractionDigits: dec, maximumFractionDigits: dec })

const fmtDate = (d) => (d ? format(new Date(d), 'MM/dd/yyyy') : '—')

function SummaryBanner({ text, color }) {
  return (
    <div style={{
      padding: '10px 14px',
      background: '#f8f9fa',
      borderLeft: `4px solid ${color}`,
      borderRadius: '6px',
      fontSize: '0.85rem',
      color: '#6c757d',
      lineHeight: 1.6,
      marginTop: '1rem',
    }}
      dangerouslySetInnerHTML={{ __html: text }}
    />
  )
}

export function DashboardPage() {
  const {
    provider, setProvider,
    customer, setCustomer, customers,
    dateStart, setDateStart,
    dateEnd,   setDateEnd,
    rows, summary, loading, bgLoading, error,
    triggerBgLoad,
  } = useDashboard()

  const [tab,        setTab]        = useState(0)
  const [uploadFile, setUploadFile] = useState(null)
  const [adminKey,   setAdminKey]   = useState('')
  const [uploadMsg,  setUploadMsg]  = useState('')
  const [uploading,  setUploading]  = useState(false)

  useEffect(() => { triggerBgLoad() }, []) // eslint-disable-line

  const dateRange = summary
    ? `${fmtDate(summary.dates.min)} to ${fmtDate(summary.dates.max)}`
    : '—'

  const handleUpload = async () => {
    if (!uploadFile || !adminKey) return
    setUploading(true)
    setUploadMsg('')
    try {
      await api.uploadFile(uploadFile, adminKey)
      setUploadMsg('✓ Data successfully processed and synced.')
    } catch (e) {
      setUploadMsg(`✗ ${e.response?.data?.detail || e.message}`)
    } finally {
      setUploading(false)
    }
  }

  const tabs = ['Contract Price', 'Capacity and Energy', 'FM Computation']

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '1rem', background: 'white', borderBottom: '1px solid #dee2e6' }}>
        <h2 style={{ margin: 0, fontWeight: 700 }}>Customer's Contract Price and FM Calculator</h2>
      </div>

      {bgLoading && (
        <div style={{
          background: '#fff3cd', borderBottom: '1px solid #ffc107',
          padding: '8px 16px', fontSize: '0.85rem', color: '#856404',
        }}>
          ⏳ Loading data...
        </div>
      )}

      {/* Controls row */}
      <div style={{
        display: 'flex', gap: '1rem', flexWrap: 'wrap',
        padding: '1rem 1.5rem', background: 'white',
        borderBottom: '1px solid #dee2e6', alignItems: 'flex-end',
      }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
          Provider
          <select value={provider} onChange={(e) => setProvider(e.target.value)}
            style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #ced4da' }}>
            <option value="GMEC">GMEC</option>
            <option value="GNPD">GNPD</option>
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
          Customer
          <select value={customer} onChange={(e) => setCustomer(e.target.value)}
            style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #ced4da', minWidth: '160px' }}>
            {customers.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
          Date start
          <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)}
            style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #ced4da' }} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
          Date end
          <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)}
            style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #ced4da' }} />
        </label>

        {/* Upload card */}
        <div style={{
          marginLeft: 'auto', background: '#f8f9fa',
          border: '1px solid #dee2e6', borderRadius: '8px',
          padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '6px',
        }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input type="file" accept=".xlsx" onChange={(e) => setUploadFile(e.target.files[0])}
              style={{ fontSize: '0.8rem' }} />
            <input type="password" placeholder="Admin key" value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #ced4da', width: '120px' }} />
          </div>
          <button onClick={handleUpload} disabled={uploading || !uploadFile || !adminKey}
            style={{
              padding: '5px 12px', borderRadius: '6px', border: 'none',
              background: '#0d6efd', color: 'white', cursor: 'pointer', fontSize: '0.8rem',
              opacity: (uploading || !uploadFile || !adminKey) ? 0.6 : 1,
            }}>
            {uploading ? 'Processing…' : '☁ Upload & Sync'}
          </button>
          {uploadMsg && <p style={{ fontSize: '0.75rem', margin: 0, color: uploadMsg.startsWith('✓') ? 'green' : 'red' }}>{uploadMsg}</p>}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', background: 'white', borderBottom: '1px solid #dee2e6', padding: '0 1.5rem' }}>
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            style={{
              padding: '10px 20px', border: 'none', background: 'none',
              cursor: 'pointer', fontSize: '0.9rem',
              borderBottom: tab === i ? '2px solid #0d6efd' : '2px solid transparent',
              color: tab === i ? '#0d6efd' : '#6c757d',
              fontWeight: tab === i ? 600 : 400,
            }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ padding: '1.5rem' }}>
        {loading && <p style={{ color: '#6c757d' }}>Loading…</p>}
        {error   && <p style={{ color: '#dc3545', fontSize: '0.9rem' }}>{error}</p>}
        {!loading && rows.length > 0 && (
          <>
            {tab === 0 && <ContractPriceTab  rows={rows} summary={summary} dateRange={dateRange} customer={customer} />}
            {tab === 1 && <CapacityEnergyTab rows={rows} summary={summary} dateRange={dateRange} customer={customer} />}
            {tab === 2 && <FMTab            rows={rows} summary={summary} dateRange={dateRange} customer={customer} />}
          </>
        )}
      </div>
    </div>
  )
}

function ContractPriceTab({ rows, summary, dateRange, customer }) {
  const label = customer === 'All Customers' ? "All Customers'" : `${customer}'s`
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '1rem' }}>
        <MetricCard title="Contract Price" value={fmt(summary.aFm)}       color="#0d6efd" dateRange={dateRange} />
        <MetricCard title="Contract Rate"  value={fmt(summary.aRate, 4)} unit=" /kWh" color="#dc3545" dateRange={dateRange} />
      </div>
      <DualAxisChart rows={rows}
        barKey="aFm" barName="Contract Price" barColor="royalblue"
        lineKey="aRate" lineName="Contract Rate" lineColor="red"
        title={`Contract Price and Rate — ${customer}`} />
      <SummaryBanner color="#4169E1"
        text={`For the period <strong>${dateRange}</strong>, <strong>${label}</strong> contract price is <strong style="color:#4169E1">₱${fmt(summary.aFm)}</strong> at a rate of <strong style="color:#dc3545">${fmt(summary.aRate, 4)}</strong> PHP/kWh.`} />
    </>
  )
}

function CapacityEnergyTab({ rows, summary, dateRange, customer }) {
  const label = customer === 'All Customers' ? "All Customers'" : `${customer}'s`
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '1rem' }}>
        <MetricCard title="Capacity Price" value={fmt(summary.yFm)}       color="#0dcaf0" dateRange={dateRange} />
        <MetricCard title="Capacity Rate"  value={fmt(summary.yRate, 4)} unit=" /kWh" color="#fd7e14" dateRange={dateRange} />
        <MetricCard title="Energy Price"   value={fmt(summary.zFm)}       color="#198754" dateRange={dateRange} />
        <MetricCard title="Energy Rate"    value={fmt(summary.zRate, 4)} unit=" /kWh" color="#dc3545" dateRange={dateRange} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <DualAxisChart rows={rows} barKey="yFm" barName="Capacity Price" barColor="deepskyblue"
          lineKey="yRate" lineName="Capacity Rate" lineColor="orange" title="Capacity Price and Rate" compact />
        <DualAxisChart rows={rows} barKey="zFm" barName="Energy Price" barColor="green"
          lineKey="zRate" lineName="Energy Rate" lineColor="red" title="Energy Price and Rate" compact />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <SummaryBanner color="#00BFFF"
          text={`<strong>${label}</strong> capacity price: <strong style="color:#00BFFF">₱${fmt(summary.yFm)}</strong> at <strong style="color:#FFA500">${fmt(summary.yRate, 4)}</strong> PHP/kWh for ${dateRange}.`} />
        <SummaryBanner color="#006400"
          text={`<strong>${label}</strong> energy price: <strong style="color:#006400">₱${fmt(summary.zFm)}</strong> at <strong style="color:#dc3545">${fmt(summary.zRate, 4)}</strong> PHP/kWh for ${dateRange}.`} />
      </div>
    </>
  )
}

function FMTab({ rows, summary, dateRange, customer }) {
  const label = customer === 'All Customers' ? "All Customers'" : `${customer}'s`

  // Stacked bar approach mirroring Plotly barmode="overlay":
  //   - fmReduction  = xFm - yFm  (the darkblue "cap" visible above, only on FM days)
  //   - yFm          = the deepskyblue portion (bottom, always full height on FM days)
  // On non-FM days fmReduction = 0, so the whole bar is deepskyblue-coloured darkblue.
  // We render yFm as deepskyblue FIRST (bottom), then fmReduction as darkblue on top.
  // On non-FM days both segments are darkblue so the bar looks solid darkblue.
  const chartRows = rows.map(r => {
    const xFm = r.xFm || 0
    const yFm = r.yFm || 0
    const hasFM = Math.abs(xFm - yFm) > 0.01
    return {
      ...r,
      fmBase:      yFm,           // deepskyblue segment (= With FM price)
      fmReduction: hasFM ? (xFm - yFm) : 0,  // darkblue cap on top (= FM impact)
      hasFM,
    }
  })

  const tickFormatter = (d) => {
    try { return format(new Date(d), 'MM/dd') } catch { return d }
  }

  // Unified hover tooltip matching Plotly's hovermode="x unified" style
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    const row = chartRows.find(r => r.Date === label) || {}
    const fmtPeso = (v) => `₱${Number(v || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
    return (
      <div style={{
        background: 'rgba(255,255,255,0.96)',
        border: '1px solid #d0d0d0',
        borderRadius: '6px',
        padding: '8px 14px',
        fontSize: '0.8rem',
        lineHeight: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        minWidth: '240px',
      }}>
        <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '0.82rem', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
          {tickFormatter(label)}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'darkblue', display: 'inline-block', flexShrink: 0 }} />
          <span style={{ color: '#444' }}>Total Without FM: <strong style={{ color: 'darkblue' }}>{fmtPeso(row.xFm)}</strong></span>
        </div>
        {row.hasFM && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: 'deepskyblue', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ color: '#444' }}>Total With FM: <strong style={{ color: 'deepskyblue' }}>{fmtPeso(row.yFm)}</strong></span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 10, height: 2, background: 'orange', display: 'inline-block', flexShrink: 0 }} />
          <span style={{ color: '#444' }}>Rate With FM: <strong style={{ color: 'orange' }}>{Number(row.yRate || 0).toFixed(4)}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 10, height: 2, background: 'lightgreen', display: 'inline-block', flexShrink: 0 }} />
          <span style={{ color: '#444' }}>Rate Without FM: <strong style={{ color: '#4a9e4a' }}>{Number(row.xRate || 0).toFixed(4)}</strong></span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '1rem' }}>
        <MetricCard title="Revenue Impact"   value={fmt(summary.revenueImpact)} color="#dc3545" dateRange={dateRange} />
        <MetricCard title="Price Without FM" value={fmt(summary.xFm)}           color="#000080" dateRange={dateRange} />
        <MetricCard title="Price With FM"    value={fmt(summary.yFm)}           color="#198754" dateRange={dateRange} />
        <MetricCard title="Rate Without FM"  value={fmt(summary.xRate, 4)} unit=" /kWh" color="#0d6efd" dateRange={dateRange} />
        <MetricCard title="Rate With FM"     value={fmt(summary.yRate, 4)} unit=" /kWh" color="#fd7e14" dateRange={dateRange} />
        <div style={{ padding: '8px 12px', background: '#f8f9fa', borderLeft: '4px solid #0d6efd', borderRadius: '6px' }}>
          <p style={{ fontSize: '0.7rem', color: '#6c757d', margin: '0 0 2px' }}>Total FM Hours</p>
          <p style={{ color: '#0d6efd', fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>{fmt(summary.xFh, 2)} Hrs</p>
          <p style={{ fontSize: '0.6rem', color: '#999', margin: '2px 0 0' }}>{dateRange}</p>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', textAlign: 'center' }}>
          Capacity Price and Rate — {customer}
        </p>
        <ResponsiveContainer width="100%" height={380}>
          <ComposedChart
            data={chartRows}
            margin={{ top: 10, right: 60, bottom: 60, left: 20 }}
            barCategoryGap="8%"
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="Date" tickFormatter={tickFormatter} angle={-45} textAnchor="end" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="left"  tickFormatter={(v) => `₱${(v/1e6).toFixed(1)}M`} tick={{ fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '0.75rem', paddingTop: '0.5rem' }}
              payload={[
                { value: 'Price Without FM', type: 'square', color: 'darkblue' },
                { value: 'Price With FM',    type: 'square', color: 'deepskyblue' },
                { value: 'Rate With FM',     type: 'line',   color: 'orange' },
                { value: 'Rate Without FM',  type: 'line',   color: 'lightgreen' },
              ]}
            />

            {/* Bottom segment: deepskyblue on FM days, darkblue on normal days */}
            <Bar yAxisId="left" dataKey="fmBase" name="Price With FM" stackId="fm" opacity={0.9} maxBarSize={40}>
              {chartRows.map((r, i) => (
                <Cell key={i} fill={r.hasFM ? 'deepskyblue' : 'darkblue'} />
              ))}
            </Bar>
            {/* Top cap: darkblue — only has height on FM days (fmReduction > 0) */}
            <Bar yAxisId="left" dataKey="fmReduction" name="Price Without FM" stackId="fm" fill="darkblue" opacity={0.85} maxBarSize={40} />

            <Line yAxisId="right" type="monotone" dataKey="yRate" name="Rate With FM"    stroke="orange"     dot={{ r: 3 }} strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="xRate" name="Rate Without FM" stroke="lightgreen" dot={{ r: 3 }} strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <SummaryBanner color="#00BFFF"
        text={`Based on billing period <strong>${dateRange}</strong>, net revenue losses due to <strong>${label}</strong> FM declaration is <strong style="color:#dc3545">₱${fmt(summary.revenueImpact)}</strong> with <strong style="color:#00BFFF">${fmt(summary.xFh, 2)}</strong> FM hrs.`} />
    </>
  )
}

function DualAxisChart({ rows, barKey, barName, barColor, bar2Key, bar2Name, bar2Color,
  lineKey, lineName, lineColor, line2Key, line2Name, line2Color, title, compact }) {

  const tickFormatter = (d) => {
    try { return format(new Date(d), 'MM/dd') } catch { return d }
  }

  return (
    <div style={{ marginBottom: compact ? 0 : '1rem' }}>
      {title && <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', textAlign: 'center' }}>{title}</p>}
      <ResponsiveContainer width="100%" height={compact ? 240 : 380}>
        <ComposedChart data={rows} margin={{ top: 10, right: 60, bottom: 60, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="Date" tickFormatter={tickFormatter} angle={-45} textAnchor="end" tick={{ fontSize: 10 }} />
          <YAxis yAxisId="left"  tickFormatter={(v) => `₱${(v/1e6).toFixed(1)}M`} tick={{ fontSize: 10 }} />
          <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
          <Tooltip formatter={(v, name) => name.includes('Rate') ? v?.toFixed(4) : `₱${Number(v).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`} />
          <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '0.5rem' }} />
          <Bar  yAxisId="left" dataKey={barKey}  name={barName}  fill={barColor}  opacity={0.85} />
          {bar2Key  && <Bar  yAxisId="left"  dataKey={bar2Key}  name={bar2Name}  fill={bar2Color}  opacity={0.75} />}
          <Line yAxisId="right" type="monotone" dataKey={lineKey}  name={lineName}  stroke={lineColor}  dot={{ r: 3 }} strokeWidth={2} />
          {line2Key && <Line yAxisId="right" type="monotone" dataKey={line2Key} name={line2Name} stroke={line2Color} dot={{ r: 3 }} strokeWidth={2} />}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}