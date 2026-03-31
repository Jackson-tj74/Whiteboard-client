"use client"

import { useState } from "react"

const RoomJoin = ({ onRoomJoin }) => {
  const [roomId, setRoomId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/rooms/join`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId: roomId.trim() }),
        }
      )
      const data = await response.json()

      if (data.success) {
        onRoomJoin(data)
      } else {
        setError(data.error || "Failed to join room")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const generateRandomRoom = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/rooms/join`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      )
      const data = await response.json()

      if (data.success) {
        onRoomJoin(data)
      } else {
        setError(data.error || "Failed to create room")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="room-join">
      <div className="room-join-container">
        <h2>Join a Whiteboard Room</h2>

        <form onSubmit={handleSubmit} className="room-form">
          <div className="input-group">
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              placeholder="Enter room code (e.g., ABC123)"
              maxLength="8"
              className="room-input"
            />
            <button type="submit" disabled={loading} className="join-btn">
              {loading ? "Joining..." : "Join Room"}
            </button>
          </div>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <button
          onClick={generateRandomRoom}
          disabled={loading}
          className="create-btn"
        >
          {loading ? "Creating..." : "Create New Room"}
        </button>

        {error && <div className="error-message">{error}</div>}

        <div className="room-info-text">
          <p>Draw together in real-time</p>
          <p>Share the room code with others</p>
        </div>
      </div>
    </div>
  )
}

export default RoomJoin