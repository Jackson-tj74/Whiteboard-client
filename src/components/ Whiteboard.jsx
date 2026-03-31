/** @format */
"use client"

import { useState, useEffect, useRef } from "react"
import io from "socket.io-client"
import DrawingCanvas from "./DrawingCanvas"
import Toolbar from "./Toolbar"
import UserCursors from "./UserCursors"

const Whiteboard = ({ roomId, initialDrawingData = [] }) => {
  const [socket, setSocket] = useState(null)
  const [userCount, setUserCount] = useState(0)
  const [cursors, setCursors] = useState({})
  const [tool, setTool] = useState({ color: "#000000", width: 2 })

  const canvasRef = useRef(null)
  const cursorThrottleRef = useRef(null)

  useEffect(() => {
    // Fixed: Added polling and error handling for connection
    const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:9000";
    
    const newSocket = io(serverUrl, {
      transports: ["polling", "websocket"], // Let it negotiate the best transport
      reconnectionAttempts: 5,
      timeout: 10000,
    })

    setSocket(newSocket)

    newSocket.on("connect", () => {
      console.log("Connected to server!");
      newSocket.emit("join-room", roomId)
    })

    newSocket.on("user-count-update", (count) => setUserCount(count))

    newSocket.on("cursor-move", (data) => {
      setCursors((prev) => ({
        ...prev,
        [data.userId]: {
          x: data.x,
          y: data.y,
          color: data.color || "#ff0000",
        },
      }))
    })

    newSocket.on("canvas-cleared", () => {
      canvasRef.current?.clearCanvas()
    })

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection failed:", err.message);
    })

    return () => newSocket.disconnect()
  }, [roomId])

  const handleCursorMove = (x, y) => {
    if (!socket || !socket.connected) return
    if (cursorThrottleRef.current) clearTimeout(cursorThrottleRef.current)

    cursorThrottleRef.current = setTimeout(() => {
      socket.emit("cursor-move", { x, y, color: tool.color })
    }, 30) // Increased throttle for better performance
  }

  const handleClearCanvas = () => {
    socket?.emit("clear-canvas")
    canvasRef.current?.clearCanvas()
  }

  return (
    <div className="whiteboard" style={{ position: 'relative', width: '100%', height: '80vh' }}>
      <div className="whiteboard-header">
        <Toolbar tool={tool} onToolChange={setTool} onClearCanvas={handleClearCanvas} />
        <div className="user-info">
          <span className="user-count">
            👥 {userCount} user{userCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="canvas-container" style={{ position: 'relative', flex: 1, backgroundColor: '#fff' }}>
        <DrawingCanvas
          ref={canvasRef}
          socket={socket}
          tool={tool}
          initialDrawingData={initialDrawingData}
          onCursorMove={handleCursorMove}
        />
        <UserCursors cursors={cursors} />
      </div>
    </div>
  )
}

export default Whiteboard