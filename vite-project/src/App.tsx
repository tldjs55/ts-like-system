import { useState, useEffect } from 'react'
import './App.css'

const USER_ID = 'user1'
const POST_ID = 'post1'

function App() {
  const [likeCount, setLikeCount] = useState(0)
  const [hasLiked, setHasLiked] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    const [countRes, likedRes] = await Promise.all([
      fetch(`/api/like-count/${POST_ID}`),
      fetch(`/api/has-liked/${USER_ID}/${POST_ID}`)
    ])
    const countData = await countRes.json()
    const likedData = await likedRes.json()
    setLikeCount(countData.count ?? 0)
    setHasLiked(likedData.liked ?? false)
  }

  const handleToggleLike = async () => {
    if (loading) return
    setLoading(true)

    const endpoint = hasLiked ? '/api/unlike' : '/api/like'

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: USER_ID, postId: POST_ID })
      })
      await fetchStatus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="post-card">
        <div className="post-header">
          <div className="avatar"></div>
          <div className="user-info">
            <span className="username">Sean Tsai</span>
            <span className="time">剛剛</span>
          </div>
        </div>

        <div className="post-content">
          <p>這是一則測試貼文</p>
        </div>

        <div className="post-stats">
          <span>{likeCount} 個讚</span>
        </div>

        <div className="post-actions">
          <button
            className={`like-btn ${hasLiked ? 'liked' : ''}`}
            onClick={handleToggleLike}
            disabled={loading}
          >
            <span className={hasLiked ? 'material-symbols-rounded' : 'material-symbols-outlined'}>
              thumb_up
            </span>
            <span>{hasLiked ? '已按讚' : '按讚'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
