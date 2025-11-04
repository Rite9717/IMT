import api from './api'

const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password })
    return response.data
  },

  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData)
    return response.data
  }
}

export default authService
