import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import messageService from '../services/messageService'
import './Messages.css'

function Inbox() {
  const [messages, setMessages] = useState([])
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    try {
      const data = await messageService.getInbox()
      setMessages(data)
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMessageClick = async (message) => {
    setSelectedMessage(message)
    if (!message.isRead) {
      try {
        await messageService.markAsRead(message.id)
        setMessages(messages.map(m => 
          m.id === message.id ? { ...m, isRead: true } : m
        ))
      } catch (error) {
        console.error('Error marking message as read:', error)
      }
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
        <h1 style={{ color: 'white', marginBottom: '20px' }}>Inbox</h1>
        <div className="messages-container">
          <div className="messages-list">
            {loading ? (
              <p>Loading messages...</p>
            ) : messages.length === 0 ? (
              <p>No messages in inbox</p>
            ) : (
              messages.map(message => (
                <div
                  key={message.id}
                  className={`message-item ${!message.isRead ? 'unread' : ''} ${selectedMessage?.id === message.id ? 'active' : ''}`}
                  onClick={() => handleMessageClick(message)}
                >
                  <div className="message-header">
                    <strong>{message.senderUsername}</strong>
                    {!message.isRead && <span className="unread-badge">New</span>}
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
                  <p><strong>From:</strong> {selectedMessage.senderUsername}</p>
                  <p><strong>Date:</strong> {new Date(selectedMessage.sentAt).toLocaleString()}</p>
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

export default Inbox
