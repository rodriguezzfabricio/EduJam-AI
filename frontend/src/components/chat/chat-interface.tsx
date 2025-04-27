"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  PaperclipIcon,
  SendIcon,
  SmileIcon,
  FileIcon,
  XIcon,
  LoaderIcon,
} from "lucide-react";

interface Message {
  id?: string;
  content: string;
  fromUser: boolean;
  userId?: string;
  timestamp?: number;
  username?: string;
  fileUrl?: string;
  fileName?: string;
  mimeType?: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onSendFile?: (file: File) => void;
  title: string;
  placeholder?: string;
  isTyping?: boolean;
  isGroupChat?: boolean;
}

export function ChatInterface({
  messages,
  onSendMessage,
  onSendFile,
  title,
  placeholder = "Type a message...",
  isTyping = false,
  isGroupChat = false,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send message on Enter (but not with Shift+Enter)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onSendFile) {
      setSelectedFile(file);
    }
  };

  const handleFileSend = async () => {
    if (selectedFile && onSendFile) {
      try {
        setIsUploading(true);
        await onSendFile(selectedFile);
        setSelectedFile(null);
      } catch (error) {
        console.error("Error uploading file:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleCancelFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Function to render file preview
  const renderFilePreview = () => {
    if (!selectedFile) return null;

    const isImage = selectedFile.type.startsWith("image/");

    return (
      <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md mb-2 flex items-center">
        {isImage ? (
          <img
            src={URL.createObjectURL(selectedFile)}
            alt="Preview"
            className="h-16 w-16 object-cover rounded"
          />
        ) : (
          <FileIcon className="h-16 w-16 p-3 text-blue-500" />
        )}
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium truncate">{selectedFile.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {(selectedFile.size / 1024).toFixed(1)} KB
          </p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleCancelFile}
          className="h-8 w-8"
        >
          <XIcon className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  // Function to render a chat message
  const renderMessage = (message: Message, index: number) => {
    const isUserMessage = message.fromUser;
    const hasFile = message.fileUrl && message.fileName;

    return (
      <div
        key={message.id || index}
        className={`mb-4 flex ${
          isUserMessage ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`max-w-[80%] rounded-lg p-3 ${
            isUserMessage
              ? "bg-blue-500 text-white"
              : "bg-gray-200 dark:bg-gray-800 text-black dark:text-white"
          }`}
        >
          {isGroupChat && !isUserMessage && message.username && (
            <p className="text-xs font-semibold mb-1 text-blue-300">
              {message.username}
            </p>
          )}
          
          {hasFile && (
            <div className="mb-2">
              <a
                href={message.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-2 bg-white dark:bg-gray-700 rounded"
              >
                <FileIcon className="h-5 w-5 mr-2 text-blue-500" />
                <span className="text-sm text-blue-500 underline truncate">
                  {message.fileName}
                </span>
              </a>
            </div>
          )}
          
          <p className="whitespace-pre-wrap">{message.content}</p>
          
          {isGroupChat && message.timestamp && (
            <p className="text-xs mt-1 opacity-70 text-right">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-900 px-4 py-3 border-b dark:border-gray-700">
        <h3 className="font-medium">{title}</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(renderMessage)}

        {isTyping && (
          <div className="flex items-center">
            <div className="bg-gray-200 dark:bg-gray-800 rounded-lg p-3 flex items-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
              <span className="ml-2 text-sm text-gray-500">AI is typing...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t dark:border-gray-700">
        {renderFilePreview()}
        
        {selectedFile ? (
          <div className="flex space-x-2">
            <Button 
              onClick={handleFileSend}
              className="flex-1"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>Send File</>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCancelFile}
              disabled={isUploading}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <Textarea
              placeholder={placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[60px] flex-1"
            />
            <div className="flex flex-col space-y-2">
              {onSendFile && (
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleFileSelect}
                  title="Attach file"
                >
                  <PaperclipIcon className="h-5 w-5" />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.docx,image/*"
                  />
                </Button>
              )}
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!input.trim()}
                title="Send message"
              >
                <SendIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 