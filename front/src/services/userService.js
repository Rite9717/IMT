import api from './api'

const userService = {
  getAllUsers: async () => {
    const response = await api.get('/users')
    return response.data
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me')
    return response.data
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`)
    return response.data
  }
}

export default userService
