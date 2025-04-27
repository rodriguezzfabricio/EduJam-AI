"use client"

import { useRef, useState, useEffect } from "react"
import webSocketService, { Stroke as WebSocketStroke, Point as WebSocketPoint } from "../services/WebSocketService"
import { v4 as uuidv4 } from 'uuid'

interface Point {
  x: number
  y: number
}

interface Stroke {
  id: string
  color: string
  width: number
  points: Point[]
}

interface WhiteboardProps {
  width?: number
  height?: number
  initialColor?: string
  initialLineWidth?: number
  boardId?: string
  onBoardCreated?: (boardId: string) => void
}

export function Whiteboard({ 
  width = 800, 
  height = 600, 
  initialColor = "#3b82f6", 
  initialLineWidth = 4,
  boardId,
  onBoardCreated
}: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPoint, setLastPoint] = useState<Point | null>(null)
  const [color, setColor] = useState(initialColor)
  const [lineWidth, setLineWidth] = useState(initialLineWidth)
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null)
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [userId] = useState(`user-${uuidv4().substring(0, 8)}`)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  
  // Available colors
  const colors = [
    "#000000", // black
    "#3b82f6", // blue
    "#ef4444", // red
    "#22c55e", // green
    "#f59e0b", // yellow
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#ffffff", // white (eraser)
  ]

  // Initialize WebSocket connection and set up handlers
  useEffect(() => {
    const connectWithRetry = async (retries = 3, delay = 1500) => {
      for (let i = 0; i < retries; i++) {
        try {
          setConnectionError(null)
          console.log(`WebSocket connection attempt ${i + 1}/${retries}`)
          await webSocketService.connectToBoard(userId)
          setIsConnected(true)
          
          // If boardId is provided, join that board
          if (boardId) {
            console.log("Joining existing board:", boardId)
            webSocketService.joinBoard(boardId)
          } else {
            // If no boardId, create a new board
            console.log("Creating new board")
            webSocketService.createBoard()
          }
          return // Success, exit the retry loop
        } catch (error) {
          console.error(`WebSocket connection attempt ${i + 1} failed:`, error)
          if (i < retries - 1) {
            // Not the last attempt, wait before retrying
            setConnectionError(`Connection failed. Retrying in ${delay/1000}s...`)
            await new Promise(resolve => setTimeout(resolve, delay))
          } else {
            // Last attempt failed
            setConnectionError("Could not connect to the server. Using local mode.")
            setIsConnected(false)
            // If we have strokes from previous state, render them
            if (strokes.length > 0) {
              renderStrokes(strokes)
            }
          }
        }
      }
    }

    // Set up WebSocket event handlers
    const setupWebSocketHandlers = () => {
      // Handle board creation response
      webSocketService.on('boardCreated', (data) => {
        const newBoardId = data.boardId
        console.log('Board created:', newBoardId)
        
        // If callback is provided, notify parent component
        if (onBoardCreated) {
          onBoardCreated(newBoardId)
        }
        
        // If board has initial state, render it
        if (data.boardState && data.boardState.strokes) {
          const initialStrokes = data.boardState.strokes.map((s: any) => ({
            id: s.id || uuidv4(),
            color: s.color,
            width: s.width,
            points: s.points
          }))
          setStrokes(initialStrokes)
          renderStrokes(initialStrokes)
        }
      })
      
      // Handle full board state received
      webSocketService.on('fullState', (data) => {
        if (data.boardState && data.boardState.strokes) {
          const boardStrokes = data.boardState.strokes.map((s: any) => ({
            id: s.id || uuidv4(),
            color: s.color,
            width: s.width,
            points: s.points
          }))
          setStrokes(boardStrokes)
          renderStrokes(boardStrokes)
        }
      })
      
      // Handle new stroke received from other users
      webSocketService.on('stroke', (data) => {
        if (data.stroke) {
          const stroke: Stroke = {
            id: data.stroke.id || uuidv4(),
            color: data.stroke.color,
            width: data.stroke.width,
            points: data.stroke.points
          }
          
          // Add stroke to local state and render
          setStrokes(prevStrokes => {
            const newStrokes = [...prevStrokes, stroke]
            // Draw the received stroke
            drawStroke(stroke)
            return newStrokes
          })
        }
      })
      
      // Handle clear board event
      webSocketService.on('boardCleared', () => {
        clearCanvas()
        setStrokes([])
      })

      // Handle WebSocket connection status changes
      webSocketService.on('connectionStatus', (data) => {
        setIsConnected(data.connected)
        if (!data.connected && data.error) {
          setConnectionError(data.error)
        } else {
          setConnectionError(null)
        }
      })
    }

    connectWithRetry()
    setupWebSocketHandlers()
    
    // Request full board state if we're joining an existing board
    if (boardId && webSocketService.isConnected()) {
      webSocketService.requestFullState()
    }

    // Cleanup on component unmount
    return () => {
      webSocketService.disconnect()
      setIsConnected(false)
    }
  }, [userId, boardId, onBoardCreated, strokes.length])

  // Render all strokes to canvas when strokes array changes
  const renderStrokes = (strokesArray: Stroke[]) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear the canvas
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw each stroke
    strokesArray.forEach(stroke => {
      drawStroke(stroke)
    })
  }

  // Draw a single stroke on the canvas
  const drawStroke = (stroke: Stroke) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (stroke.points.length < 2) return

    ctx.beginPath()
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
    
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y)
    }
    
    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsDrawing(true)
    
    const point = getPoint(e, canvas)
    setLastPoint(point)
    
    // Create a new stroke
    const newStroke: Stroke = {
      id: uuidv4(),
      color: color,
      width: lineWidth,
      points: [point]
    }
    
    setCurrentStroke(newStroke)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPoint || !currentStroke) return
    
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const currentPoint = getPoint(e, canvas)
    
    // Add point to current stroke
    setCurrentStroke(prev => {
      if (!prev) return null
      return {
        ...prev,
        points: [...prev.points, currentPoint]
      }
    })
    
    // Draw line
    ctx.beginPath()
    ctx.moveTo(lastPoint.x, lastPoint.y)
    ctx.lineTo(currentPoint.x, currentPoint.y)
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'
    ctx.stroke()

    setLastPoint(currentPoint)
  }

  const stopDrawing = () => {
    if (isDrawing && currentStroke) {
      // Make sure the stroke has at least 2 points
      const validStroke = currentStroke.points.length >= 2 ? currentStroke : null;
      
      if (validStroke) {
        // Add the completed stroke to strokes array
        setStrokes(prev => [...prev, validStroke])
        
        // Send the stroke to the WebSocket server
        if (isConnected) {
          try {
            const wsStroke: WebSocketStroke = {
              color: validStroke.color,
              width: validStroke.width,
              points: validStroke.points as WebSocketPoint[]
            }
            
            webSocketService.sendStroke(wsStroke)
          } catch (error) {
            console.error("Failed to send stroke:", error)
            setConnectionError("Failed to send drawing to server. Working in local mode.")
            setIsConnected(false)
          }
        }
      }
    }
    
    setIsDrawing(false)
    setLastPoint(null)
    setCurrentStroke(null)
  }

  const getPoint = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, 
    canvas: HTMLCanvasElement
  ): Point => {
    const rect = canvas.getBoundingClientRect()
    
    if ('touches' in e) {
      // Touch event
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      }
    } else {
      // Mouse event
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Clear strokes array
    setStrokes([])
    
    // Send clear command to server
    if (isConnected) {
      try {
        webSocketService.clearBoard()
      } catch (error) {
        console.error("Failed to send clear command:", error)
        setConnectionError("Failed to clear board on server. Working in local mode.")
        setIsConnected(false)
      }
    }
  }

  // Try to reconnect to the WebSocket server
  const handleRetryConnection = async () => {
    setConnectionError("Attempting to reconnect...")
    try {
      await webSocketService.connectToBoard(userId)
      setIsConnected(true)
      setConnectionError(null)
      
      if (boardId) {
        webSocketService.joinBoard(boardId)
      }
    } catch (error) {
      console.error("Reconnection failed:", error)
      setConnectionError("Failed to reconnect. Using local mode.")
      setIsConnected(false)
    }
  }

  return (
    <div className="whiteboard-container">
      <div className="whiteboard-controls mb-4 flex flex-wrap items-center gap-4">
        <div className="color-palette flex gap-2">
          {colors.map((colorOption) => (
            <button
              key={colorOption}
              className={`w-8 h-8 rounded-full border-2 ${color === colorOption ? 'border-black dark:border-white' : 'border-transparent'}`}
              style={{ backgroundColor: colorOption }}
              onClick={() => setColor(colorOption)}
              aria-label={`Select color ${colorOption}`}
            />
          ))}
        </div>
        
        <div className="brush-size flex items-center gap-2">
          <span className="text-sm">Size:</span>
          <input
            type="range"
            min="1"
            max="30"
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
            className="w-32"
          />
          <span className="text-sm">{lineWidth}px</span>
        </div>
        
        <button 
          onClick={clearCanvas}
          className="px-3 py-1 bg-muted rounded-md text-sm hover:bg-muted/80 transition-colors"
        >
          Clear
        </button>
        
        {!isConnected && (
          <div className="flex items-center gap-2">
            <div className="text-sm text-destructive">
              {connectionError || "Disconnected - using local mode"}
            </div>
            <button
              onClick={handleRetryConnection}
              className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>
      
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-border rounded-lg touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
    </div>
  )
} 