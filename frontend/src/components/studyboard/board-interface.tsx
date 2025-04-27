"use client";

import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "@/services/websocket-provider";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Pencil1Icon, 
  EraserIcon, 
  ColorWheelIcon, 
  TrashIcon, 
  ResetIcon, 
  DownloadIcon, 
  ImageIcon,
  TextIcon,
} from "@radix-ui/react-icons";
import { Zap } from "lucide-react";

interface DrawEvent {
  type: "start" | "move" | "end";
  x: number;
  y: number;
  color: string;
  width: number;
  eraser: boolean;
  userId: string;
}

interface TextEvent {
  type: "text";
  x: number;
  y: number;
  text: string;
  color: string;
  userId: string;
}

interface ClearEvent {
  type: "clear";
  userId: string;
}

interface Point {
  x: number;
  y: number;
}

interface BoardInterfaceProps {
  boardId: string;
  groupId?: string;
}

export function BoardInterface({ boardId, groupId }: BoardInterfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const [tool, setTool] = useState<"pen" | "eraser" | "text">("pen");
  const { boardWs } = useWebSocket();
  const { user } = useAuth();
  
  // Text input state
  const [textInput, setTextInput] = useState("");
  const [textPosition, setTextPosition] = useState<Point | null>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  
  // Get canvas context
  const getContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  };
  
  // Initialize canvas and WebSocket listeners
  useEffect(() => {
    // Initialize canvas with white background
    const ctx = getContext();
    const canvas = canvasRef.current;
    
    if (!ctx || !canvas) return;
    
    // Set canvas dimensions to match parent container
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;
      
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
      // Fill with white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    
    // Connect to board WebSocket
    boardWs.send({
      type: "joinBoard",
      boardId,
      groupId,
    });
    
    // Listen for draw events
    boardWs.on("drawEvent", handleDrawEvent);
    boardWs.on("textEvent", handleTextEvent);
    boardWs.on("clearEvent", handleClearEvent);
    
    // Get board state on connection
    boardWs.on("boardState", (data) => {
      const image = new Image();
      image.onload = () => {
        ctx.drawImage(image, 0, 0);
      };
      image.src = data.imageData;
    });
    
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      boardWs.off("drawEvent");
      boardWs.off("textEvent");
      boardWs.off("clearEvent");
      boardWs.off("boardState");
    };
  }, [boardWs, boardId, groupId]);
  
  // Handle drawing events received from WebSocket
  const handleDrawEvent = (event: DrawEvent) => {
    const ctx = getContext();
    if (!ctx || event.userId === user?.uid) return; // Ignore our own events
    
    ctx.strokeStyle = event.eraser ? "#ffffff" : event.color;
    ctx.lineWidth = event.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    if (event.type === "start") {
      ctx.beginPath();
      ctx.moveTo(event.x, event.y);
    } else if (event.type === "move") {
      ctx.lineTo(event.x, event.y);
      ctx.stroke();
    }
  };
  
  // Handle text events received from WebSocket
  const handleTextEvent = (event: TextEvent) => {
    const ctx = getContext();
    if (!ctx || event.userId === user?.uid) return; // Ignore our own events
    
    ctx.font = "16px Arial";
    ctx.fillStyle = event.color;
    ctx.fillText(event.text, event.x, event.y);
  };
  
  // Handle clear events received from WebSocket
  const handleClearEvent = (event: ClearEvent) => {
    const ctx = getContext();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };
  
  // Canvas mouse/touch event handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (tool === "text") {
      // Set text position and focus the input
      setTextPosition({ x, y });
      textInputRef.current?.focus();
      return;
    }
    
    setIsDrawing(true);
    
    const ctx = getContext();
    if (!ctx) return;
    
    ctx.strokeStyle = isEraser ? "#ffffff" : color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    // Send start event to WebSocket
    boardWs.send({
      type: "drawEvent",
      event: {
        type: "start",
        x,
        y,
        color,
        width: lineWidth,
        eraser: isEraser,
        userId: user?.uid,
      },
      boardId,
    });
  };
  
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = getContext();
    if (!ctx) return;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Send move event to WebSocket
    boardWs.send({
      type: "drawEvent",
      event: {
        type: "move",
        x,
        y,
        color,
        width: lineWidth,
        eraser: isEraser,
        userId: user?.uid,
      },
      boardId,
    });
  };
  
  const handlePointerUp = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    // Send end event to WebSocket
    boardWs.send({
      type: "drawEvent",
      event: {
        type: "end",
        x: 0,
        y: 0,
        color,
        width: lineWidth,
        eraser: isEraser,
        userId: user?.uid,
      },
      boardId,
    });
  };
  
  // Handle text input submission
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!textInput.trim() || !textPosition) return;
    
    const ctx = getContext();
    if (!ctx) return;
    
    // Draw text on canvas
    ctx.font = "16px Arial";
    ctx.fillStyle = color;
    ctx.fillText(textInput, textPosition.x, textPosition.y);
    
    // Send text event to WebSocket
    boardWs.send({
      type: "textEvent",
      event: {
        type: "text",
        x: textPosition.x,
        y: textPosition.y,
        text: textInput,
        color,
        userId: user?.uid,
      },
      boardId,
    });
    
    // Reset text input
    setTextInput("");
    setTextPosition(null);
    setTool("pen");
  };
  
  // Clear the board
  const handleClear = () => {
    const ctx = getContext();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Send clear event to WebSocket
    boardWs.send({
      type: "clearEvent",
      event: {
        type: "clear",
        userId: user?.uid,
      },
      boardId,
    });
  };
  
  // Download the board as an image
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement("a");
    link.download = `studyboard-${boardId}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };
  
  // Upload an image to the board
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const ctx = getContext();
        const canvas = canvasRef.current;
        if (!ctx || !canvas) return;
        
        // Draw the image at the center of the canvas
        const x = (canvas.width - img.width) / 2;
        const y = (canvas.height - img.height) / 2;
        ctx.drawImage(img, x, y);
        
        // Save board state to server
        const imageData = canvas.toDataURL("image/png");
        boardWs.send({
          type: "saveBoard",
          boardId,
          imageData,
        });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };
  
  // Request AI suggestion for study notes
  const handleAiSuggestion = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Get current board image
    const imageData = canvas.toDataURL("image/png");
    
    // Send to backend for AI processing
    boardWs.send({
      type: "aiSuggestion",
      boardId,
      imageData,
    });
    
    // Listen for AI response (would show loading and handle the response)
    // This is a placeholder - you'd implement proper state and UI feedback
    alert("AI is analyzing your board and will provide suggestions soon!");
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-2 border-b dark:border-gray-700">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant={tool === "pen" ? "default" : "outline"}
                onClick={() => { setTool("pen"); setIsEraser(false); }}
              >
                <Pencil1Icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Pen</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant={tool === "eraser" ? "default" : "outline"}
                onClick={() => { setTool("eraser"); setIsEraser(true); }}
              >
                <EraserIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Eraser</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant={tool === "text" ? "default" : "outline"}
                onClick={() => { setTool("text"); setIsEraser(false); }}
              >
                <TextIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Text</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Button size="icon" variant="outline">
                  <ColorWheelIcon className="h-4 w-4" style={{ color }} />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>Color</TooltipContent>
          </Tooltip>
          
          <div className="h-8 border-r border-gray-300 dark:border-gray-600 mx-1" />
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="outline" onClick={handleClear}>
                <TrashIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear board</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Button size="icon" variant="outline">
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>Upload image</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="outline" onClick={handleDownload}>
                <DownloadIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download board</TooltipContent>
          </Tooltip>
          
          <div className="h-8 border-r border-gray-300 dark:border-gray-600 mx-1" />
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="outline" onClick={handleAiSuggestion}>
                <Zap className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>AI Suggestion</TooltipContent>
          </Tooltip>
          
          <div className="h-8 border-r border-gray-300 dark:border-gray-600 mx-1" />
          
          <div className="flex items-center">
            <span className="text-sm mr-2">Width:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm ml-2">{lineWidth}px</span>
          </div>
        </TooltipProvider>
      </div>
      
      <div className="relative flex-1">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerOut={handlePointerUp}
        />
        
        {textPosition && (
          <form 
            onSubmit={handleTextSubmit}
            className="absolute"
            style={{ left: textPosition.x, top: textPosition.y }}
          >
            <input
              ref={textInputRef}
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="Type text here..."
              autoFocus
            />
          </form>
        )}
      </div>
    </div>
  );
} 