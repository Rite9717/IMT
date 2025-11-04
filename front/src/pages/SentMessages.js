import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import messageService from '../services/messageService'
import './Messages.css'

function SentMessages() {
  const [messages, setMessages] = useState([])
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    try {
      const data = await messageService.getSentMessages()
      setMessages(data)
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await messageService.deleteMessage(messageId)
        setMessages(messages.filter(m => m.id !== messageId))
        setSelectedMessage(null)
      } catch (error) {
        console.error('Error deleting message:', error)
      }
    }
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <h1 style={{ color: 'white', marginBottom: '20px' }}>Sent Messages</h1>
        <div className="messages-container">
          <div className="messages-list">
            {loading ? (
              <p>Loading messages...</p>
            ) : messages.length === 0 ? (
              <p>No sent messages</p>
            ) : (
              messages.map(message => (
                <div
                  key={message.id}
                  className={`message-item ${selectedMessage?.id === message.id ? 'active' : ''}`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <div className="message-header">
                    <strong>To: {message.receiverUsername}</strong>
                    {message.isRead && <span className="read-badge">Read</span>}
                  </div>
                  <div className="message-subject">{message.subject}</div>
                  <div className="message-date">
                    {new Date(message.sentAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="message-detail">
            {selectedMessage ? (
              <>
                <div className="message-detail-header">
                  <h2>{selectedMessage.subject}</h2>
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
                <div className="message-meta">
                  <p><strong>To:</strong> {selectedMessage.receiverUsername}</p>
                  <p><strong>Date:</strong> {new Date(selectedMessage.sentAt).toLocaleString()}</p>
                  {selectedMessage.isRead && (
                    <p><strong>Read:</strong> {new Date(selectedMessage.readAt).toLocaleString()}</p>
                  )}
                </div>
                <div className="message-body">
                  {selectedMessage.body}
                </div>
              </>
            ) : (
              <div className="no-message-selected">
                <p>Select a message to view</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SentMessages
