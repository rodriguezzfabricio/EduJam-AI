"use client";

import React, { createContext, useContext, useEffect } from "react";
import { studyGroupWebSocket, boardWebSocket, chatWebSocket } from "./websocket";
import { useAuth } from "@/lib/auth-context";

// Define the WebSocketService interface
export interface WebSocketService {
  connect: () => void;
  disconnect: () => void;
  isConnected: () => boolean;
  send: (data: any) => boolean;
  sendBinary: (data: Uint8Array) => boolean;
  on: (type: string, callback: (data: any) => void) => void;
  off: (type: string) => void;
  onConnect: (callback: () => void) => void;
  onDisconnect: (callback: () => void) => void;
  setToken: (token: string | null) => void;
}

interface WebSocketContextType {
  studyGroupWs: WebSocketService;
  boardWs: WebSocketService;
  chatWs: WebSocketService;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  
  // Set authentication token for all WebSocket services
  useEffect(() => {
    studyGroupWebSocket.setToken(token);
    boardWebSocket.setToken(token);
    chatWebSocket.setToken(token);
  }, [token]);
  
  // Connect all WebSocket services when the provider mounts
  useEffect(() => {
    const connectAllSockets = () => {
      if (typeof window !== 'undefined') {
        studyGroupWebSocket.connect();
        boardWebSocket.connect();
        chatWebSocket.connect();
      }
    };
    
    connectAllSockets();
    
    return () => {
      studyGroupWebSocket.disconnect();
      boardWebSocket.disconnect();
      chatWebSocket.disconnect();
    };
  }, []);
  
  const value = {
    studyGroupWs: studyGroupWebSocket,
    boardWs: boardWebSocket,
    chatWs: chatWebSocket,
  };
  
  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
} 