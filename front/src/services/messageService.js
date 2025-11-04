import api from './api'

const messageService = {
  sendMessage: async (messageData) => {
    const response = await api.post('/messages', messageData)
    return response.data
  },

  getInbox: async () => {
    const response = await api.get('/messages/inbox')
    return response.data
  },

  getSentMessages: async () => {
    const response = await api.get('/messages/sent')
    return response.data
  },

  markAsRead: async (messageId) => {
    const response = await api.put(`/messages/${messageId}/read`)
    return response.data
  },

  deleteMessage: async (messageId) => {
    const response = await api.delete(`/messages/${messageId}`)
    return response.data
  },

  getUnreadCount: async () => {
    const response = await api.get('/messages/unread-count')
    return response.data
  }
}

export default messageService
