import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const client = axios.create({ baseURL: BASE })

client.interceptors.request.use((config) => {
  const pwd = sessionStorage.getItem('stl_pwd')
  if (pwd) config.headers['X-Session-Password'] = pwd
  return config
})

export const api = {
  login: (password) =>
    client.post('/auth/login', { password }),

  getCustomers: (provider) =>
    client.get('/data/customers', { params: { provider } }),

  getDaily: (provider, customer, dateStart, dateEnd) =>
    client.get('/data/daily', {
      params: { provider, customer, date_start: dateStart, date_end: dateEnd },
    }),

  loadRemaining: (dateCode = null) =>
    client.get('/data/load-remaining', {
      params: dateCode ? { date_code: dateCode } : {},
    }),

  uploadFile: (file, adminKey) => {
    const form = new FormData()
    form.append('file', file)
    return client.post('/upload', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Admin-Key': adminKey,
      },
    })
  },

  health: () => client.get('/health'),
}
