import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../api'
import { subDays, format } from 'date-fns'

const today = new Date()
const defaultStart = format(subDays(today, 30), 'yyyy-MM-dd')
const defaultEnd   = format(today, 'yyyy-MM-dd')

// Read provider from env — set VITE_PROVIDER=GMEC or VITE_PROVIDER=GNPD in Vercel
const ENV_PROVIDER = import.meta.env.VITE_PROVIDER || 'GMEC'

export function useDashboard() {
  const [provider,  setProvider]  = useState(ENV_PROVIDER)
  const [customer,  setCustomer]  = useState('')
  const [customers, setCustomers] = useState([])
  const [dateStart, setDateStart] = useState(defaultStart)
  const [dateEnd,   setDateEnd]   = useState(defaultEnd)
  const [rows,      setRows]      = useState([])
  const [loading,   setLoading]   = useState(false)
  const [bgLoading, setBgLoading] = useState(false)
  const [error,     setError]     = useState(null)
  const bgFiredRef = useRef(false)

  useEffect(() => {
    api.getCustomers(provider)
      .then(({ data }) => {
        const list = data.customers
        setCustomers(list)
        setCustomer(list[0] || '')
      })
      .catch(() => setCustomers([]))
  }, [provider])

  const fetchData = useCallback(() => {
    if (!customer) return
    setLoading(true)
    setError(null)
    api.getDaily(provider, customer, dateStart, dateEnd)
      .then(({ data }) => {
        setRows(data.rows || [])
        if (data.message) setError(data.message)
      })
      .catch((e) => setError(e.response?.data?.detail || e.message))
      .finally(() => setLoading(false))
  }, [provider, customer, dateStart, dateEnd])

  useEffect(() => { fetchData() }, [fetchData])

  const triggerBgLoad = useCallback(() => {
    if (bgFiredRef.current) return
    bgFiredRef.current = true
    setBgLoading(true)
    api.loadRemaining()
      .then(() => fetchData())
      .catch(() => {})
      .finally(() => setBgLoading(false))
  }, [fetchData])

  const triggerDateLoad = useCallback((dateCode) => {
    api.loadRemaining(dateCode)
      .then(() => fetchData())
      .catch(() => {})
  }, [fetchData])

  const summary = (() => {
    if (!rows.length) return null
    const sum  = (key) => rows.reduce((a, r) => a + (r[key] || 0), 0)
    const bkwh = sum('bFm') * 1000
    const rate  = (key) => bkwh === 0 ? 0 : sum(key) / bkwh
    return {
      dates: { min: rows[0]?.Date, max: rows[rows.length - 1]?.Date },
      aFm:   sum('aFm'),
      aRate: rate('aFm'),
      yFm:   sum('yFm'),
      yRate: rate('yFm'),
      zFm:   sum('zFm'),
      zRate: rate('zFm'),
      xFm:   sum('xFm'),
      xRate: rate('xFm'),
      xFh:   sum('xFh'),
      revenueImpact: sum('xFm') - sum('yFm'),
    }
  })()

  return {
    provider, setProvider,
    customer, setCustomer, customers,
    dateStart, setDateStart,
    dateEnd,   setDateEnd,
    rows, summary,
    loading, bgLoading, error,
    fetchData, triggerBgLoad, triggerDateLoad,
  }
}