"use client";

import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useWebSocket } from "@/services/websocket-provider";
import { useAuth } from "@/lib/auth-context";

interface Message {
  id: string;
  content: string;
  fromUser: boolean;
  userId?: string;
  username?: string;
  timestamp?: number;
  fileUrl?: string;
  fileName?: string;
  mimeType?: string;
}

interface UseChatOptions {
  type: "ai" | "group";
  groupId?: string;
  sessionId?: string;
}

export function useChat({ type, groupId, sessionId = uuidv4() }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { chatWs, studyGroupWs } = useWebSocket();
  const { user } = useAuth();
  const ws = type === "ai" ? chatWs : studyGroupWs;
  
  // Handler for AI chat messages
  const handleAiMessage = useCallback((data: any) => {
    if (data.type === "message") {
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          content: data.message.content,
          fromUser: data.message.fromUser,
          fileUrl: data.message.fileUrl,
          fileName: data.message.fileName,
          mimeType: data.message.mimeType,
        },
      ]);
    } else if (data.type === "typing") {
      setIsTyping(data.status);
    } else if (data.type === "history") {
      const historyMessages = data.messages.map((msg: any) => ({
        id: uuidv4(),
        content: msg.content,
        fromUser: msg.fromUser,
        fileUrl: msg.fileUrl,
        fileName: msg.fileName,
        mimeType: msg.mimeType,
      }));
      setMessages(historyMessages);
    }
  }, []);
  
  // Handler for group chat messages
  const handleGroupMessage = useCallback((data: any) => {
    if (data.type === "groupChatMessage" && data.groupId === groupId) {
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          content: data.message,
          fromUser: data.userId === user?.uid,
          userId: data.userId,
          username: data.username || "User",
          timestamp: data.timestamp,
        },
      ]);
    }
  }, [groupId, user?.uid]);
  
  // Register WebSocket listeners
  useEffect(() => {
    if (type === "ai") {
      chatWs.on("message", handleAiMessage);
      chatWs.on("typing", handleAiMessage);
      chatWs.on("history", handleAiMessage);
      chatWs.on("error", (data) => console.error("Chat error:", data));
      
      // Get chat history when connected
      chatWs.onConnect(() => {
        chatWs.send({
          type: "getHistory",
          sessionId,
        });
        
        // Register the chat session
        chatWs.send({
          type: "register",
          sessionId,
          username: user?.displayName || "User",
        });
      });
    } else if (type === "group") {
      studyGroupWs.on("groupChatMessage", handleGroupMessage);
    }
    
    return () => {
      if (type === "ai") {
        chatWs.off("message");
        chatWs.off("typing");
        chatWs.off("history");
        chatWs.off("error");
      } else if (type === "group") {
        studyGroupWs.off("groupChatMessage");
      }
    };
  }, [type, chatWs, studyGroupWs, sessionId, handleAiMessage, handleGroupMessage, user?.displayName]);
  
  // Send a text message
  const sendMessage = useCallback((content: string) => {
    if (type === "ai") {
      chatWs.send({
        type: "message",
        sessionId,
        message: content,
      });
    } else if (type === "group" && groupId) {
      studyGroupWs.send({
        type: "sendGroupChatMessage",
        groupId,
        message: content,
      });
      
      // Add message to local state immediately for a responsive UI
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          content,
          fromUser: true,
          userId: user?.uid,
          username: user?.displayName || "You",
          timestamp: Date.now(),
        },
      ]);
    }
  }, [type, chatWs, studyGroupWs, sessionId, groupId, user?.uid, user?.displayName]);
  
  // Send a file (AI chat only)
  const sendFile = useCallback(async (file: File): Promise<void> => {
    if (type !== "ai") return Promise.reject("File upload is only supported in AI chat");
    
    return new Promise((resolve, reject) => {
      // Initialize file upload
      chatWs.send({
        type: "initFileUpload",
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
      });
      
      // Listen for initialization confirmation
      const handleInit = (data: any) => {
        if (data.type === "fileUploadInitialized" && data.ready) {
          const fileId = data.fileId;
          
          // Remove the initialization listener
          chatWs.off("fileUploadInitialized");
          
          // Send the file data in chunks
          const chunkSize = 64 * 1024; // 64KB chunks
          let offset = 0;
          
          const sendNextChunk = async () => {
            if (offset < file.size) {
              const chunk = file.slice(offset, offset + chunkSize);
              const arrayBuffer = await chunk.arrayBuffer();
              const uint8Array = new Uint8Array(arrayBuffer);
              
              // Send binary data
              if (chatWs.isConnected()) {
                chatWs.sendBinary(uint8Array);
                offset += chunkSize;
                setTimeout(sendNextChunk, 10); // Small delay to prevent flooding
              } else {
                reject("WebSocket connection lost");
              }
            } else {
              // All chunks sent, finalize upload
              chatWs.send({
                type: "fileUploadComplete",
                fileId,
                fileName: file.name,
                mimeType: file.type,
              });
              
              resolve();
            }
          };
          
          sendNextChunk();
        }
      };
      
      chatWs.on("fileUploadInitialized", handleInit);
      
      // Set a timeout to prevent hanging
      setTimeout(() => {
        chatWs.off("fileUploadInitialized");
        reject("File upload initialization timed out");
      }, 10000);
    });
  }, [type, chatWs]);
  
  return {
    messages,
    isTyping,
    sendMessage,
    sendFile: type === "ai" ? sendFile : undefined,
  };
} 