"use client"

import { useState } from "react"
import { Whiteboard } from "../../components/Whiteboard"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Input } from "@/components/ui/input"

export default function WhiteboardLandingPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [roomCode, setRoomCode] = useState("")
  const [error, setError] = useState("")
  
  const handleBoardCreated = (boardId: string) => {
    console.log("Board created with ID:", boardId)
    router.push(`/whiteboard/${boardId}`)
  }
  
  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomCode.trim()) {
      setError("Please enter a room code")
      return
    }
    
    // Clean any non-alphanumeric characters for safety
    const cleanCode = roomCode.replace(/[^a-zA-Z0-9-]/g, "")
    router.push(`/whiteboard/${cleanCode}`)
  }
  
  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Interactive Whiteboard</h1>
          <p className="text-muted-foreground mt-2">
            Create or join a collaborative whiteboard to draw and share ideas in real-time
          </p>
        </div>
        
        {!isCreating ? (
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-12">
            <div className="w-full md:w-1/2 max-w-md bg-card p-6 rounded-lg border border-border">
              <h2 className="text-xl font-semibold mb-4">Create New Room</h2>
              <p className="mb-6 text-muted-foreground">
                Start a new collaborative whiteboard session and invite others to join.
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Create New Room
              </button>
            </div>
            
            <div className="text-center md:text-left text-muted-foreground my-4 md:my-0">OR</div>
            
            <div className="w-full md:w-1/2 max-w-md bg-card p-6 rounded-lg border border-border">
              <h2 className="text-xl font-semibold mb-4">Join Existing Room</h2>
              <p className="mb-4 text-muted-foreground">
                Enter a room code to join an existing whiteboard session.
              </p>
              <form onSubmit={handleJoinRoom} className="space-y-4">
                <div>
                  <Input
                    placeholder="Enter room code"
                    value={roomCode}
                    onChange={(e) => {
                      setRoomCode(e.target.value)
                      setError("")
                    }}
                    className="w-full"
                  />
                  {error && <p className="text-destructive text-sm mt-1">{error}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                >
                  Join Room
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <p className="mb-4 text-center">
              Setting up your collaborative whiteboard...
            </p>
            <div className="flex justify-center">
              <Whiteboard 
                width={900} 
                height={600} 
                onBoardCreated={handleBoardCreated} 
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
} 