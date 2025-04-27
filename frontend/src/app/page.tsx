"use client"

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Maximize2, Minimize2, Loader2, Settings, X } from "lucide-react";
import { Whiteboard } from "../components/Whiteboard";
import aiService, { ChatMessage } from "@/services/AIService";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [boardId, setBoardId] = useState<string | null>(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isApiKeySet, setIsApiKeySet] = useState(false);

  useEffect(() => {
    // Add welcome message
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Welcome to the interactive whiteboard! I can answer questions about any topic. How can I help you today?",
        timestamp: Date.now()
      }
    ]);

    // Generate a persistent board ID for the home page
    setBoardId(uuidv4().substring(0, 8));

    // Check if we have an API key in localStorage
    const savedApiKey = localStorage.getItem('openai-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      aiService.init(savedApiKey);
      setIsApiKeySet(true);
    }
  }, []);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: query,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setQuery("");
    setIsLoading(true);

    try {
      // Get AI response
      const response = await aiService.sendMessage([...messages, userMessage]);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      // Add error message
      setMessages(prev => [
        ...prev,
        {
          id: `error_${Date.now()}`,
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: Date.now()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChatSize = () => {
    setIsChatExpanded(!isChatExpanded);
  };

  const handleSetApiKey = () => {
    if (apiKey.trim()) {
      // Save to localStorage and initialize the service
      localStorage.setItem('openai-api-key', apiKey);
      aiService.init(apiKey);
      setIsApiKeySet(true);
      setShowApiKeyInput(false);
      // Add confirmation message
      setMessages(prev => [
        ...prev,
        {
          id: `system_${Date.now()}`,
          role: "assistant",
          content: "API key set successfully! I can now provide more accurate and comprehensive responses to your questions.",
          timestamp: Date.now()
        }
      ]);
    }
  };

  const clearApiKey = () => {
    localStorage.removeItem('openai-api-key');
    setApiKey("");
    setIsApiKeySet(false);
    aiService.init("");
    // Add confirmation message
    setMessages(prev => [
      ...prev,
      {
        id: `system_${Date.now()}`,
        role: "assistant",
        content: "API key removed. I'll continue to provide responses using the simulated mode.",
        timestamp: Date.now()
      }
    ]);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex overflow-hidden">
        {/* Main whiteboard area */}
        <div className={`whiteboard-area ${isChatExpanded ? 'hidden md:block md:w-1/2' : 'w-full md:w-3/4'} p-4`}>
          {boardId && <Whiteboard width={1200} height={800} boardId={boardId} />}
        </div>
        
        {/* Chat sidebar */}
        <div className={`chat-sidebar ${isChatExpanded ? 'w-full md:w-1/2' : 'w-full md:w-1/4'} border-l border-border bg-card p-4 flex flex-col`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">AI Chat Assistant</h2>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                title={isApiKeySet ? "Change API Key" : "Set OpenAI API Key"}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleChatSize}>
                {isChatExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {showApiKeyInput && (
            <div className="mb-4 p-3 bg-muted rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">OpenAI API Key</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowApiKeyInput(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                {isApiKeySet ? 
                  "API key is set. You can change it or clear it below." : 
                  "Add your OpenAI API key to get better AI responses (optional)."}
              </div>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1 text-xs"
                />
                <Button size="sm" onClick={handleSetApiKey} disabled={!apiKey.trim()}>
                  Save
                </Button>
                {isApiKeySet && (
                  <Button size="sm" variant="destructive" onClick={clearApiKey}>
                    Clear
                  </Button>
                )}
              </div>
            </div>
          )}
          
          <div className="chat-messages flex-1 overflow-auto space-y-4 mb-4 p-2">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>Ask me anything about your whiteboard or any other topic!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}>
                      <div className="flex flex-col">
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        <div className={`text-xs mt-1 ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3 flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <Input
              placeholder="Ask any question..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !query.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
