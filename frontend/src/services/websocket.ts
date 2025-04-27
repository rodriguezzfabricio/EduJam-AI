"use client";

export class WebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private onConnectCallbacks: (() => void)[] = [];
  private onDisconnectCallbacks: (() => void)[] = [];
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastPingTime: number = 0;
  private pingIntervalMs = 30000; // 30 seconds

  constructor(baseUrl: string, path: string) {
    this.url = `${baseUrl}${path}`;
  }

  public setToken(token: string | null) {
    this.token = token;
  }

  public connect() {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    const url = this.token
      ? `${this.url}?token=${encodeURIComponent(this.token)}`
      : this.url;

    try {
      this.socket = new WebSocket(url);
      this.setupEventListeners();
    } catch (error) {
      console.error("WebSocket connection error:", error);
      this.scheduleReconnect();
    }
  }

  public disconnect() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  public isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  public send(data: any) {
    if (!this.isConnected()) {
      console.warn("WebSocket is not connected. Message not sent.");
      return false;
    }

    try {
      const message = typeof data === "string" ? data : JSON.stringify(data);
      this.socket?.send(message);
      return true;
    } catch (error) {
      console.error("Error sending WebSocket message:", error);
      return false;
    }
  }

  public sendBinary(data: Uint8Array) {
    if (!this.isConnected()) {
      console.warn("WebSocket is not connected. Binary data not sent.");
      return false;
    }

    try {
      this.socket?.send(data);
      return true;
    } catch (error) {
      console.error("Error sending binary data through WebSocket:", error);
      return false;
    }
  }

  public on(type: string, callback: (data: any) => void) {
    this.messageHandlers.set(type, callback);
  }

  public off(type: string) {
    this.messageHandlers.delete(type);
  }

  public onConnect(callback: () => void) {
    this.onConnectCallbacks.push(callback);
    if (this.isConnected()) {
      callback();
    }
  }

  public onDisconnect(callback: () => void) {
    this.onDisconnectCallbacks.push(callback);
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.onopen = () => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.onConnectCallbacks.forEach(callback => callback());
    };

    this.socket.onclose = () => {
      console.log("WebSocket disconnected");
      this.stopHeartbeat();
      this.onDisconnectCallbacks.forEach(callback => callback());
      this.scheduleReconnect();
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const type = data.type;

        if (type === "ping") {
          this.send({ type: "pong" });
          return;
        }

        if (type === "pong") {
          // Update last ping time
          this.lastPingTime = Date.now();
          return;
        }

        const handler = this.messageHandlers.get(type);
        if (handler) {
          handler(data);
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("Maximum reconnect attempts reached");
      return;
    }

    const timeout = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
    this.reconnectAttempts++;

    console.log(`Reconnecting in ${timeout}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, timeout);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.lastPingTime = Date.now();

    this.heartbeatInterval = setInterval(() => {
      if (!this.isConnected()) {
        this.stopHeartbeat();
        return;
      }

      // Check if we've received a pong recently
      const now = Date.now();
      if (now - this.lastPingTime > this.pingIntervalMs * 2) {
        console.warn("No ping response received, reconnecting...");
        this.disconnect();
        this.connect();
        return;
      }

      this.send({ type: "ping" });
    }, this.pingIntervalMs);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

// Create WebSocket service instances
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";

export const studyGroupWebSocket = new WebSocketService(WS_BASE_URL, "/ws/study-group");
export const boardWebSocket = new WebSocketService(WS_BASE_URL, "/ws/board");
export const chatWebSocket = new WebSocketService(WS_BASE_URL, "/ws/chat"); 