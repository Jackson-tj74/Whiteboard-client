/** @format */
"use client"

import { useRef, useEffect, forwardRef, useImperativeHandle } from "react"

const DrawingCanvas = forwardRef(
  ({ socket, tool, initialDrawingData = [], onCursorMove }, ref) => {
    const canvasRef = useRef(null)
    const isDrawingRef = useRef(false)
    const currentStrokeRef = useRef(null)

    useImperativeHandle(ref, () => ({
      clearCanvas: () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      },
    }))

    const drawStroke = (stroke, isComplete) => {
      const canvas = canvasRef.current
      if (!canvas || !stroke || !stroke.points) return
      const ctx = canvas.getContext("2d")
      
      ctx.strokeStyle = stroke.color || "#000000"
      ctx.lineWidth = stroke.width || 2
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      ctx.beginPath()
      if (stroke.points.length === 1) {
        const point = stroke.points[0]
        ctx.arc(point.x, point.y, stroke.width / 2, 0, 2 * Math.PI)
        ctx.fill()
      } else {
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y)
        }
        ctx.stroke()
      }
    }

    // Fixed: Added Array check to prevent .forEach crash
    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const resizeCanvas = () => {
        const container = canvas.parentElement
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
        
        if (Array.isArray(initialDrawingData)) {
          initialDrawingData.forEach((stroke) => drawStroke(stroke, true))
        }
      }

      resizeCanvas()
      window.addEventListener("resize", resizeCanvas)
      return () => window.removeEventListener("resize", resizeCanvas)
    }, [initialDrawingData])

    // Fixed: Added Array check here too
    useEffect(() => {
      if (Array.isArray(initialDrawingData)) {
        initialDrawingData.forEach((stroke) => drawStroke(stroke, true))
      }
    }, [initialDrawingData])

    useEffect(() => {
      if (!socket) return

      const handleDrawStart = (data) => drawStroke(data.stroke, false)
      const handleDrawMove = (data) => data.stroke?.points?.length && drawStroke(data.stroke, false)
      const handleDrawEnd = (data) => drawStroke(data.stroke, true)

      socket.on("draw-start", handleDrawStart)
      socket.on("draw-move", handleDrawMove)
      socket.on("draw-end", handleDrawEnd)

      return () => {
        socket.off("draw-start", handleDrawStart)
        socket.off("draw-move", handleDrawMove)
        socket.off("draw-end", handleDrawEnd)
      }
    }, [socket])

    const getMousePos = (e) => {
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    const startDrawing = (pos) => {
      isDrawingRef.current = true
      currentStrokeRef.current = {
        id: Date.now() + Math.random(),
        points: [pos],
        color: tool.color,
        width: tool.width,
        timestamp: new Date(),
      }
      socket?.emit("draw-start", { stroke: currentStrokeRef.current })
      drawStroke(currentStrokeRef.current, false)
    }

    const continueDrawing = (pos) => {
      if (!isDrawingRef.current) return
      currentStrokeRef.current.points.push(pos)
      socket?.emit("draw-move", { stroke: currentStrokeRef.current })
      drawStroke(currentStrokeRef.current, false)
    }

    const stopDrawing = () => {
      if (!isDrawingRef.current) return
      isDrawingRef.current = false
      socket?.emit("draw-end", { stroke: currentStrokeRef.current })
      currentStrokeRef.current = null
    }

    return (
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        style={{ width: '100%', height: '100%', display: 'block' }}
        onMouseDown={(e) => startDrawing(getMousePos(e))}
        onMouseMove={(e) => {
          const pos = getMousePos(e)
          if (onCursorMove) onCursorMove(pos.x, pos.y)
          isDrawingRef.current && continueDrawing(pos)
        }}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={(e) => { e.preventDefault(); startDrawing({ x: e.touches[0].clientX, y: e.touches[0].clientY }) }}
        onTouchMove={(e) => { e.preventDefault(); isDrawingRef.current && continueDrawing({ x: e.touches[0].clientX, y: e.touches[0].clientY }) }}
        onTouchEnd={(e) => { e.preventDefault(); stopDrawing() }}
      />
    )
  }
)

export default DrawingCanvas