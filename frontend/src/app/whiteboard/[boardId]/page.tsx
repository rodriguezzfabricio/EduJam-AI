"use client"

import { useParams } from "next/navigation"
import { Whiteboard } from "../../../components/Whiteboard"
import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { LinkIcon, Users, ClipboardCheck, ClipboardCopy } from "lucide-react"
import webSocketService from "@/services/WebSocketService"

export default function WhiteboardPage() {
  const params = useParams()
  const boardId = params.boardId as string
  const [isSharing, setIsSharing] = useState(false)
  const [participants, setParticipants] = useState<string[]>([])
  const [roomUrl, setRoomUrl] = useState("")

  useEffect(() => {
    // Set room URL for sharing
    if (typeof window !== 'undefined') {
      setRoomUrl(`${window.location.origin}/whiteboard/${boardId}`)
    }

    // Set up event listener for participants
    webSocketService.on('userJoined', (data) => {
      if (data.userId && !participants.includes(data.userId)) {
        setParticipants(prev => [...prev, data.userId])
      }
    })

    webSocketService.on('userLeft', (data) => {
      if (data.userId) {
        setParticipants(prev => prev.filter(id => id !== data.userId))
      }
    })

    // Cleanup event listeners on unmount
    return () => {
      webSocketService.off('userJoined', () => {})
      webSocketService.off('userLeft', () => {})
    }
  }, [boardId, participants])

  const handleShareBoard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(roomUrl)
      setIsSharing(true)
      setTimeout(() => setIsSharing(false), 2000)
    } else {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea")
      textArea.value = roomUrl
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setIsSharing(true)
      setTimeout(() => setIsSharing(false), 2000)
    }
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold">Collaborative Whiteboard</h1>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Room Code:</span>
              <span className="text-sm font-mono">{boardId}</span>
              <button
                onClick={handleShareBoard}
                className="ml-2"
                aria-label="Copy room link"
              >
                {isSharing ? (
                  <ClipboardCheck className="h-4 w-4 text-green-500" />
                ) : (
                  <ClipboardCopy className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                )}
              </button>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {participants.length > 0 
                  ? `${participants.length + 1} participants` 
                  : "1 participant"}
              </span>
            </div>
            
            <button 
              onClick={handleShareBoard}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              {isSharing ? "Copied!" : "Share Board"}
            </button>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Whiteboard 
            width={900} 
            height={600} 
            boardId={boardId}
          />
        </div>
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Share the room code or URL with others to collaborate in real-time. All changes are synchronized instantly.</p>
        </div>
      </div>
    </>
  )
} 