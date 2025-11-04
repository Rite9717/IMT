import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import messageService from '../services/messageService'
import userService from '../services/userService'
import './Compose.css'

function Compose() {
  const [users, setUsers] = useState([])
  const [formData, setFormData] = useState({
    receiverId: '',
    subject: '',
    body: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const data = await userService.getAllUsers()
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await messageService.sendMessage({
        ...formData,
        receiverId: parseInt(formData.receiverId)
      })
      setSuccess('Message sent successfully!')
      setTimeout(() => {
        navigate('/sent')
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="compose-container">
          <h1>Compose Message</h1>
          <form onSubmit={handleSubmit} className="compose-form">
            <div className="form-group">
              <label>To:</label>
              <select
                name="receiverId"
                value={formData.receiverId}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Select recipient</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Subject:</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Message:</label>
              <textarea
                name="body"
                value={formData.body}
                onChange={handleChange}
                rows="10"
                required
                disabled={loading}
              />
            </div>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/dashboard')}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Compose
