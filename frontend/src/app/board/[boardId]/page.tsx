"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/navbar";
import { BoardInterface } from "@/components/studyboard/board-interface";

interface BoardParams {
  boardId: string;
}

export default function WhiteboardPage({ params }: { params: BoardParams }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [boardInfo, setBoardInfo] = useState<{
    name: string;
    subject?: string;
    groupId?: string;
  } | null>(null);
  
  // Extract boardId from params
  const { boardId } = params;
  
  // Protect the route
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);
  
  // Fetch board info
  useEffect(() => {
    if (user && boardId) {
      // This would normally be an API call
      // For demo, we'll use mock data based on boardId
      const fetchBoardInfo = async () => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data - in real app this would come from API
        if (boardId.startsWith("board")) {
          // Study group board
          const groupBoards: Record<string, { name: string; subject: string; groupId: string }> = {
            board1: { name: "Calculus Whiteboard", subject: "Mathematics", groupId: "sg1" },
            board2: { name: "Physics Lab Notes", subject: "Physics", groupId: "sg2" },
            board3: { name: "Literature Analysis Board", subject: "English", groupId: "sg3" },
            board4: { name: "CS Project Planning", subject: "Computer Science", groupId: "sg4" },
          };
          
          setBoardInfo(groupBoards[boardId] || { name: "Study Group Board" });
        } else {
          // Personal board
          setBoardInfo({ name: "Personal Whiteboard" });
        }
        
        setLoading(false);
      };
      
      fetchBoardInfo();
    }
  }, [user, boardId]);
  
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col">
        <div className="border-b py-2 px-4">
          <div className="container mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{boardInfo?.name || "Interactive Whiteboard"}</h1>
              {boardInfo?.subject && (
                <p className="text-sm text-muted-foreground">{boardInfo.subject}</p>
              )}
            </div>
            
            <div className="text-sm">
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500"></span>
                Live Collaboration
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 relative">
          <BoardInterface boardId={boardId} groupId={boardInfo?.groupId} />
        </div>
      </main>
    </div>
  );
} 