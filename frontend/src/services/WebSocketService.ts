/**
 * WebSocketService.ts
 * This service manages WebSocket connections to the backend for the whiteboard and chat features.
 */

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  color: string;
  width: number;
  points: Point[];
}

export interface BoardSettings {
  width: number;
  height: number;
  backgroundColor: string;
  showGrid: boolean;
  gridSize: number;
}

interface BoardState {
  strokes: Stroke[];
  settings: BoardSettings;
}

type WebSocketMessageHandler = (message: any) => void;

class WebSocketService {
  private boardSocket: WebSocket | null = null;
  private chatSocket: WebSocket | null = null;
  private boardId: string | null = null;
  private userId: string | null = null;
  private messageHandlers: Map<string, WebSocketMessageHandler[]> = new Map();
  private connectionStatus: 'connecting' | 'connected' | 'disconnected' = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private lastBoardStates: Map<string, BoardState> = new Map(); // Cache board states

  // Get the base URL dynamically
  private getBaseUrl(): string {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return 'ws://localhost:8080';
    }
    
    const isProduction = process.env.NODE_ENV === 'production';
    const protocol = isProduction ? 'wss' : 'ws';
    const host = isProduction ? window.location.host : 'localhost:8080';
    return `${protocol}://${host}`;
  }

  /**
   * Initialize the WebSocket connection for the whiteboard
   * @param userId The user's ID for tracking in the session
   * @returns Promise that resolves when connected
   */
  public connectToBoard(userId: string): Promise<void> {
    this.userId = userId;
    const baseUrl = this.getBaseUrl();
    
    return new Promise((resolve, reject) => {
      try {
        // Close existing connection if any
        if (this.boardSocket) {
          this.boardSocket.close();
        }
        
        this.connectionStatus = 'connecting';
        console.log(`Connecting to WebSocket at ${baseUrl}/ws/board`);
        this.boardSocket = new WebSocket(`${baseUrl}/ws/board`);
        
        this.boardSocket.onopen = () => {
          console.log('Board WebSocket connected successfully');
          this.connectionStatus = 'connected';
          this.reconnectAttempts = 0;
          resolve();
        };
        
        this.boardSocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("Received WebSocket message:", data.type);
            this.handleBoardMessage(data);
            
            // Cache board state for reconnection
            if (data.type === 'boardJoined' || data.type === 'fullState') {
              if (data.boardId && data.boardState) {
                this.lastBoardStates.set(data.boardId, data.boardState);
              }
            }
          } catch (error) {
            console.error("Error processing WebSocket message:", error);
          }
        };
        
        this.boardSocket.onerror = (error) => {
          console.error('Board WebSocket error:', error);
          if (this.connectionStatus === 'connecting') {
            reject(error);
          }
        };
        
        this.boardSocket.onclose = (event) => {
          console.log(`Board WebSocket disconnected with code: ${event.code}, reason: ${event.reason}`);
          this.connectionStatus = 'disconnected';
          this.attemptReconnect();
        };
      } catch (error) {
        console.error("WebSocket connection failed:", error);
        this.connectionStatus = 'disconnected';
        reject(error);
      }
    });
  }

  /**
   * Attempt to reconnect when the connection is lost
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Maximum reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    this.reconnectTimeout = setTimeout(() => {
      if (this.userId) {
        this.connectToBoard(this.userId)
          .then(() => {
            // Rejoin board if we had one
            if (this.boardId) {
              console.log(`Reconnected, rejoining board: ${this.boardId}`);
              this.joinBoard(this.boardId);
            }
          })
          .catch(error => {
            console.error('Reconnection failed:', error);
          });
      }
    }, delay);
  }

  /**
   * Handle incoming messages from the board WebSocket
   */
  private handleBoardMessage(data: any): void {
    const type = data.type;
    
    // Call all registered handlers for this message type
    const handlers = this.messageHandlers.get(type) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in handler for '${type}':`, error);
      }
    });
  }

  /**
   * Create a new whiteboard
   */
  public createBoard(): void {
    if (!this.boardSocket || this.boardSocket.readyState !== WebSocket.OPEN) {
      console.error('Cannot create board: WebSocket is not connected');
      return;
    }

    const message = {
      type: 'createBoard'
    };

    console.log("Sending createBoard message");
    this.boardSocket.send(JSON.stringify(message));
  }

  /**
   * Join an existing whiteboard
   * @param boardId The ID of the board to join
   */
  public joinBoard(boardId: string): void {
    if (!this.boardSocket) {
      console.error('Cannot join board: WebSocket is not initialized');
      return;
    }
    
    if (this.boardSocket.readyState !== WebSocket.OPEN) {
      console.error(`Cannot join board: WebSocket is not open (state: ${this.boardSocket.readyState})`);
      return;
    }

    this.boardId = boardId;
    const message = {
      type: 'joinBoard',
      boardId
    };

    console.log(`Sending joinBoard message for board ${boardId}`);
    this.boardSocket.send(JSON.stringify(message));
  }

  /**
   * Send a stroke to the server
   * @param stroke The stroke data to send
   */
  public sendStroke(stroke: Stroke): void {
    if (!this.boardSocket || this.boardSocket.readyState !== WebSocket.OPEN) {
      console.error('Cannot send stroke: WebSocket is not connected');
      return;
    }

    if (!this.boardId) {
      console.error('Cannot send stroke: No board ID set');
      return;
    }

    const message = {
      type: 'stroke',
      boardId: this.boardId,
      stroke
    };

    this.boardSocket.send(JSON.stringify(message));
  }

  /**
   * Clear the whiteboard
   */
  public clearBoard(): void {
    if (!this.boardSocket || this.boardSocket.readyState !== WebSocket.OPEN) {
      console.error('Cannot clear board: WebSocket is not connected');
      return;
    }

    if (!this.boardId) {
      console.error('Cannot clear board: No board ID set');
      return;
    }

    const message = {
      type: 'clearBoard',
      boardId: this.boardId
    };

    this.boardSocket.send(JSON.stringify(message));
  }

  /**
   * Undo the last action
   */
  public undo(): void {
    if (!this.boardSocket || this.boardSocket.readyState !== WebSocket.OPEN) {
      console.error('Cannot undo: WebSocket is not connected');
      return;
    }

    if (!this.boardId) {
      console.error('Cannot undo: No board ID set');
      return;
    }

    const message = {
      type: 'undo',
      boardId: this.boardId
    };

    this.boardSocket.send(JSON.stringify(message));
  }

  /**
   * Redo the last undone action
   */
  public redo(): void {
    if (!this.boardSocket || this.boardSocket.readyState !== WebSocket.OPEN) {
      console.error('Cannot redo: WebSocket is not connected');
      return;
    }

    if (!this.boardId) {
      console.error('Cannot redo: No board ID set');
      return;
    }

    const message = {
      type: 'redo',
      boardId: this.boardId
    };

    this.boardSocket.send(JSON.stringify(message));
  }

  /**
   * Update board settings
   * @param settings The new board settings
   */
  public updateBoardSettings(settings: Partial<BoardSettings>): void {
    if (!this.boardSocket || this.boardSocket.readyState !== WebSocket.OPEN) {
      console.error('Cannot update settings: WebSocket is not connected');
      return;
    }

    if (!this.boardId) {
      console.error('Cannot update settings: No board ID set');
      return;
    }

    const message = {
      type: 'updateBoardSettings',
      boardId: this.boardId,
      settings
    };

    this.boardSocket.send(JSON.stringify(message));
  }

  /**
   * Request the full state of the board
   */
  public requestFullState(): void {
    if (!this.boardSocket || this.boardSocket.readyState !== WebSocket.OPEN) {
      console.error('Cannot request state: WebSocket is not connected');
      return;
    }

    if (!this.boardId) {
      console.error('Cannot request state: No board ID set');
      return;
    }

    const message = {
      type: 'requestFullState',
      boardId: this.boardId
    };

    console.log(`Requesting full state for board ${this.boardId}`);
    this.boardSocket.send(JSON.stringify(message));
  }

  /**
   * Register a handler for a specific message type
   * @param type The message type to handle
   * @param handler The handler function
   */
  public on(type: string, handler: WebSocketMessageHandler): void {
    const handlers = this.messageHandlers.get(type) || [];
    handlers.push(handler);
    this.messageHandlers.set(type, handlers);
  }

  /**
   * Remove a handler for a specific message type
   * @param type The message type
   * @param handler The handler function to remove
   */
  public off(type: string, handler: WebSocketMessageHandler): void {
    const handlers = this.messageHandlers.get(type) || [];
    const index = handlers.indexOf(handler);
    
    if (index !== -1) {
      handlers.splice(index, 1);
      this.messageHandlers.set(type, handlers);
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.boardSocket) {
      this.boardSocket.close();
      this.boardSocket = null;
    }

    if (this.chatSocket) {
      this.chatSocket.close();
      this.chatSocket = null;
    }

    this.connectionStatus = 'disconnected';
    this.boardId = null;
  }

  /**
   * Check if the socket is connected
   */
  public isConnected(): boolean {
    return this.connectionStatus === 'connected';
  }

  /**
   * Get the current board ID
   */
  public getBoardId(): string | null {
    return this.boardId;
  }

  /**
   * Get the cached board state (if available)
   */
  public getCachedBoardState(boardId: string): BoardState | null {
    return this.lastBoardStates.get(boardId) || null;
  }
}

// Export a singleton instance
export const webSocketService = new WebSocketService();
export default webSocketService; 