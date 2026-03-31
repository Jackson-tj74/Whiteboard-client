"use client"

import { useState } from "react"
import RoomJoin from "./components/RoomJoin"
import Whiteboard from "./components/ Whiteboard"
import "./App.css"

function App() {
  const [currentRoom, setCurrentRoom] = useState(null)
  const [drawingData, setDrawingData] = useState([])

  const handleRoomJoin = (roomData) => {
    setCurrentRoom(roomData.roomId)
    setDrawingData(roomData.drawingData || [])
  }

  const handleLeaveRoom = () => {
    setCurrentRoom(null)
    setDrawingData([])
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>Collaborative Whiteboard</h1>
        {currentRoom && (
          <div className="room-info">
            <span>
              Room: <strong>{currentRoom}</strong>
            </span>
            <button onClick={handleLeaveRoom} className="leave-btn">
              Leave Room
            </button>
          </div>
        )}
      </header>

      <main className="app-main">
        {!currentRoom ? (
          <RoomJoin onRoomJoin={handleRoomJoin} />
        ) : (
          <Whiteboard roomId={currentRoom} initialDrawingData={drawingData} />
        )}
      </main>
    </div>
  )
}

export default App