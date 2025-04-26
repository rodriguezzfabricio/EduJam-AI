package EduJam.AI.handler;

import EduJam.AI.model.BoardModel;
import EduJam.AI.model.StrokeModel;
import EduJam.AI.model.UserSessionModel;
import EduJam.AI.service.BoardService;
import EduJam.AI.service.UserSessionService;
import EduJam.AI.dto.BoardDto;
import EduJam.AI.dto.StrokeDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.PingMessage;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.io.IOException;
import java.util.HashMap;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * WebSocket handler for whiteboard operations.
 * 
 * This handler manages real-time collaborative drawing sessions:
 * - Tracks which sessions are connected to which boards
 * - Broadcasts drawing events to all clients on the same board
 * - Manages session cleanup when clients disconnect
 * 
 * Broadcasting implementation:
 * - Active sessions are stored in {@link #boardSessionsMap} keyed by boardId
 * - When a stroke is drawn, it's immediately broadcast to all connected clients on the same board
 * - A throttling mechanism is available (disabled by default) to batch rapid stroke updates
 * 
 * Testing with curl:
 * ```
 * curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
 * -H "Host: localhost:8080" -H "Origin: http://localhost:8080" \
 * -H "Sec-WebSocket-Key: SGVsbG8sIHdvcmxkIQ==" \
 * -H "Sec-WebSocket-Version: 13" \
 * http://localhost:8080/api/boards/socket
 * ```
 * 
 * Or with websocat:
 * ```
 * websocat ws://localhost:8080/api/boards/socket
 * ```
 * Then send: {"type":"createBoard"}
 * Then send: {"type":"stroke","boardId":"<boardId>","stroke":{"color":"#FF0000","width":2,"points":[{"x":10,"y":20},{"x":30,"y":40}]}}
 */
@Component
public class BoardSocketHandler extends TextWebSocketHandler {
    private static final Logger log = LoggerFactory.getLogger(BoardSocketHandler.class);
    
    // Configuration
    private static final boolean ENABLE_THROTTLING = false;
    private static final long THROTTLE_MS = 16; // ~60fps
    private static final long HEARTBEAT_INTERVAL_MS = 30000; // 30 seconds
    
    private final BoardService boardService;
    private final UserSessionService sessionService;
    private final ObjectMapper objectMapper;
    private final Map<String, String> sessionToBoardMap = new ConcurrentHashMap<>();
    private final Map<String, Set<WebSocketSession>> boardSessionsMap = new ConcurrentHashMap<>();
    private final ScheduledExecutorService heartbeatScheduler = Executors.newSingleThreadScheduledExecutor();

    public BoardSocketHandler(BoardService boardService, UserSessionService sessionService, ObjectMapper objectMapper) {
        this.boardService = boardService;
        this.sessionService = sessionService;
        this.objectMapper = objectMapper;
        
        // Start the heartbeat scheduler
        heartbeatScheduler.scheduleAtFixedRate(this::sendHeartbeats, HEARTBEAT_INTERVAL_MS, HEARTBEAT_INTERVAL_MS, TimeUnit.MILLISECONDS);
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String sessionId = session.getId();
        // Create and register a new session with the board session
        UserSessionModel userSession = new UserSessionModel("user-" + sessionId);
        userSession.setBoardSession(session);
        sessionService.registerSession(userSession);
        sessionService.touch(sessionId);
        
        log.debug("WebSocket connection established for session: {}", sessionId);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        JsonNode jsonNode = objectMapper.readTree(message.getPayload());
        String type = jsonNode.get("type").asText();

        // Touch the session to update activity timestamp
        sessionService.touch(session.getId());

        switch (type) {
            case "createBoard":
                handleCreateBoard(session, jsonNode);
                break;
            case "joinBoard":
                handleJoinBoard(session, jsonNode);
                break;
            case "stroke":
                handleStroke(session, jsonNode);
                break;
            case "undo":
                handleUndo(session, jsonNode);
                break;
            case "redo":
                handleRedo(session, jsonNode);
                break;
            case "clearBoard":
                handleClearBoard(session, jsonNode);
                break;
            case "updateBoardSettings":
                handleUpdateBoardSettings(session, jsonNode);
                break;
            case "requestFullState":
                handleRequestFullState(session, jsonNode);
                break;
            case "pong":
                // Client responded to ping, nothing to do
                break;
            default:
                sendErrorMessage(session, "Unknown message type: " + type);
        }
    }

    private void handleCreateBoard(WebSocketSession session, JsonNode jsonNode) throws Exception {
        var board = boardService.createBoard();
        String boardId = board.getId();
        sessionToBoardMap.put(session.getId(), boardId);
        
        // Add this session to the board's sessions
        Set<WebSocketSession> boardSessions = boardSessionsMap.computeIfAbsent(boardId, k -> ConcurrentHashMap.newKeySet());
        boardSessions.add(session);

        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
            "type", "boardCreated",
            "boardId", boardId,
            "boardState", Map.of(
                "strokes", board.getStrokes(),
                "settings", Map.of(
                    "width", board.getWidth(),
                    "height", board.getHeight(),
                    "backgroundColor", board.getBackgroundColor(),
                    "showGrid", board.isShowGrid(),
                    "gridSize", board.getGridSize()
                )
            )
        ))));
        
        log.debug("Board created: {} by session: {}", boardId, session.getId());
    }

    private void handleJoinBoard(WebSocketSession session, JsonNode jsonNode) throws IOException {
        String boardId = jsonNode.get("boardId").asText();
        BoardDto board = boardService.getBoardById(boardId);
        
        if (board == null) {
            sendErrorMessage(session, "Board not found: " + boardId);
            return;
        }

        // Store the session's board ID
        sessionToBoardMap.put(session.getId(), boardId);
        
        // Add this session to the board's sessions
        Set<WebSocketSession> boardSessions = boardSessionsMap.computeIfAbsent(boardId, k -> ConcurrentHashMap.newKeySet());
        boardSessions.add(session);
        
        // Notify other users that a new user has joined
        Map<String, Object> joinedMessage = new HashMap<>();
        joinedMessage.put("type", "userJoined");
        joinedMessage.put("userId", session.getId());
        joinedMessage.put("boardId", boardId);
        
        try {
            broadcastToBoard(boardId, joinedMessage, session.getId());
        } catch (IOException e) {
            throw new IOException("Error broadcasting join message", e);
        }
        
        // Send confirmation and board state to the joining user
        Map<String, Object> confirmationMessage = new HashMap<>();
        confirmationMessage.put("type", "boardJoined");
        confirmationMessage.put("boardId", boardId);
        confirmationMessage.put("boardState", board);
        
        String confirmationJson = objectMapper.writeValueAsString(confirmationMessage);
        session.sendMessage(new TextMessage(confirmationJson));
        
        log.debug("Session: {} joined board: {}, active sessions: {}", session.getId(), boardId, boardSessions.size());
    }

    private void handleRequestFullState(WebSocketSession session, JsonNode jsonNode) throws IOException {
        String boardId = jsonNode.get("boardId").asText();
        BoardDto board = boardService.getBoardById(boardId);
        
        if (board == null) {
            sendErrorMessage(session, "Board not found: " + boardId);
            return;
        }
        
        // Verify session is connected to this board
        String sessionBoardId = sessionToBoardMap.get(session.getId());
        if (sessionBoardId == null || !sessionBoardId.equals(boardId)) {
            sendErrorMessage(session, "You are not connected to this board");
            return;
        }
        
        // Send full board state
        Map<String, Object> response = new HashMap<>();
        response.put("type", "fullBoardState");
        response.put("boardId", boardId);
        response.put("boardState", board);
        
        String responseJson = objectMapper.writeValueAsString(response);
        session.sendMessage(new TextMessage(responseJson));
    }

    private void handleStroke(WebSocketSession session, JsonNode jsonNode) throws IOException {
        String boardId = jsonNode.get("boardId").asText();
        String sessionBoardId = sessionToBoardMap.get(session.getId());
        
        if (sessionBoardId == null || !sessionBoardId.equals(boardId)) {
            sendErrorMessage(session, "You are not connected to board: " + boardId);
            return;
        }
        
        // Extract stroke data
        JsonNode strokeNode = jsonNode.get("stroke");
        StrokeDto stroke = objectMapper.treeToValue(strokeNode, StrokeDto.class);
        
        // Save the stroke to the board
        boardService.addStroke(boardId, stroke);
        
        // Apply throttling if enabled
        if (ENABLE_THROTTLING) {
            try {
                Thread.sleep(THROTTLE_MS);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.warn("Throttling interrupted", e);
            }
        }
        
        try {
            // Send using the ORIGINAL format that frontend likely expects
            Map<String, Object> originalFormatMessage = new HashMap<>();
            originalFormatMessage.put("type", "stroke");
            originalFormatMessage.put("boardId", boardId);
            originalFormatMessage.put("stroke", stroke);
            
            broadcastToBoard(boardId, originalFormatMessage, null);
            log.debug("Stroke broadcasted to board using original format: {}", boardId);
        } catch (IOException e) {
            log.error("Error broadcasting stroke to board: {}", boardId, e);
            throw new IOException("Error broadcasting stroke", e);
        }
    }

    private void handleClearBoard(WebSocketSession session, JsonNode jsonNode) throws IOException {
        String boardId = jsonNode.get("boardId").asText();
        if (boardId == null) {
            throw new IllegalArgumentException("Board ID is required");
        }

        boardService.clearBoard(boardId);

        // Broadcast clear to all sessions on the same board
        Map<String, Object> clearMessage = new HashMap<>();
        clearMessage.put("type", "boardCleared");
        clearMessage.put("boardId", boardId);
        
        try {
            broadcastToBoard(boardId, clearMessage, null);
        } catch (IOException e) {
            throw new IOException("Error broadcasting clear message", e);
        }
    }

    private void handleUndo(WebSocketSession session, JsonNode jsonNode) throws IOException {
        String boardId = jsonNode.get("boardId").asText();
        String sessionBoardId = sessionToBoardMap.get(session.getId());
        
        if (sessionBoardId == null || !sessionBoardId.equals(boardId)) {
            sendErrorMessage(session, "You are not connected to board: " + boardId);
            return;
        }
        
        boolean success = boardService.undoLastStroke(boardId);
        
        if (!success) {
            sendErrorMessage(session, "Nothing to undo");
            return;
        }
        
        // Get the updated board state
        BoardDto board = boardService.getBoardById(boardId);
        
        // Send the undo confirmation to all sessions on this board with the full board state
        Map<String, Object> response = new HashMap<>();
        response.put("type", "strokeUndone");
        response.put("boardId", boardId);
        response.put("boardState", board);
        
        try {
            broadcastToBoard(boardId, response, null);
        } catch (IOException e) {
            throw new IOException("Error broadcasting undo", e);
        }
    }

    private void handleRedo(WebSocketSession session, JsonNode jsonNode) throws IOException {
        String boardId = jsonNode.get("boardId").asText();
        String sessionBoardId = sessionToBoardMap.get(session.getId());
        
        if (sessionBoardId == null || !sessionBoardId.equals(boardId)) {
            sendErrorMessage(session, "You are not connected to board: " + boardId);
            return;
        }
        
        StrokeDto redoneStroke = boardService.redoLastStroke(boardId);
        
        if (redoneStroke == null) {
            sendErrorMessage(session, "Nothing to redo");
            return;
        }
        
        // Get the updated board state
        BoardDto board = boardService.getBoardById(boardId);
        
        // Send the redo confirmation to all sessions on this board with the full board state
        Map<String, Object> response = new HashMap<>();
        response.put("type", "strokeRedone");
        response.put("boardId", boardId);
        response.put("boardState", board);
        
        try {
            broadcastToBoard(boardId, response, null);
        } catch (IOException e) {
            throw new IOException("Error broadcasting redo", e);
        }
    }

    private void handleUpdateBoardSettings(WebSocketSession session, JsonNode jsonNode) throws IOException {
        String boardId = jsonNode.get("boardId").asText();
        String sessionBoardId = sessionToBoardMap.get(session.getId());
        
        if (sessionBoardId == null || !sessionBoardId.equals(boardId)) {
            sendErrorMessage(session, "You are not connected to board: " + boardId);
            return;
        }
        
        JsonNode settingsNode = jsonNode.get("settings");
        if (settingsNode == null) {
            sendErrorMessage(session, "Settings are required");
            return;
        }
        
        int width = settingsNode.has("width") ? settingsNode.get("width").asInt() : 800;
        int height = settingsNode.has("height") ? settingsNode.get("height").asInt() : 600;
        String backgroundColor = settingsNode.has("backgroundColor") ? 
                settingsNode.get("backgroundColor").asText() : "#FFFFFF";
        boolean showGrid = settingsNode.has("showGrid") ? settingsNode.get("showGrid").asBoolean() : false;
        int gridSize = settingsNode.has("gridSize") ? settingsNode.get("gridSize").asInt() : 20;
        
        // Update board settings
        boardService.updateBoardSettings(boardId, width, height, backgroundColor, showGrid, gridSize);
        
        // Get updated board state
        BoardDto updatedBoard = boardService.getBoardById(boardId);
        
        // Send updated settings to all clients
        Map<String, Object> response = new HashMap<>();
        response.put("type", "boardSettingsUpdated");
        response.put("boardId", boardId);
        response.put("settings", Map.of(
            "width", updatedBoard.getWidth(),
            "height", updatedBoard.getHeight(),
            "backgroundColor", updatedBoard.getBackgroundColor(),
            "showGrid", updatedBoard.isShowGrid(),
            "gridSize", updatedBoard.getGridSize()
        ));
        
        broadcastToBoard(boardId, response, null);
    }

    /**
     * Broadcasts a message to all sessions connected to a specific board
     * 
     * @param boardId The board ID to broadcast to
     * @param message The message to broadcast
     * @param excludeSessionId Optional session ID to exclude from the broadcast (can be null)
     */
    private void broadcastToBoard(String boardId, Map<String, Object> message, String excludeSessionId) throws IOException {
        Set<WebSocketSession> sessions = boardSessionsMap.get(boardId);
        if (sessions == null || sessions.isEmpty()) {
            return;
        }
        
        String messageJson = objectMapper.writeValueAsString(message);
        
        for (WebSocketSession targetSession : sessions) {
            // Skip if this is the excluded session
            if (excludeSessionId != null && targetSession.getId().equals(excludeSessionId)) {
                continue;
            }
            
            if (targetSession.isOpen()) {
                try {
                    targetSession.sendMessage(new TextMessage(messageJson));
                } catch (IOException e) {
                    log.warn("Failed to send message to session {}: {}", targetSession.getId(), e.getMessage());
                    // Remove failed session
                    cleanupSession(targetSession);
                }
            } else {
                // Remove closed session
                cleanupSession(targetSession);
            }
        }
    }
    
    /**
     * Broadcasts an event message to all sessions connected to a specific board
     * using the standardized event format { event, payload }
     *
     * @param boardId The board ID to broadcast to
     * @param eventMessage The event message to broadcast
     */
    private void broadcastEventToBoard(String boardId, Map<String, Object> eventMessage) throws IOException {
        Set<WebSocketSession> sessions = boardSessionsMap.get(boardId);
        if (sessions == null || sessions.isEmpty()) {
            return;
        }
        
        String messageJson = objectMapper.writeValueAsString(eventMessage);
        
        for (WebSocketSession targetSession : sessions) {
            if (targetSession.isOpen()) {
                try {
                    targetSession.sendMessage(new TextMessage(messageJson));
                } catch (IOException e) {
                    log.warn("Failed to send event to session {}: {}", targetSession.getId(), e.getMessage());
                    // Remove failed session
                    cleanupSession(targetSession);
                }
            } else {
                // Remove closed session
                cleanupSession(targetSession);
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        cleanupSession(session);
        super.afterConnectionClosed(session, status);
    }
    
    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.error("Transport error for session {}: {}", session.getId(), exception.getMessage());
        cleanupSession(session);
        super.handleTransportError(session, exception);
    }
    
    /**
     * Cleans up resources associated with a WebSocket session
     */
    private void cleanupSession(WebSocketSession session) {
        String sessionId = session.getId();
        String boardId = sessionToBoardMap.remove(sessionId);
        
        if (boardId != null) {
            // Notify other users when someone leaves the board
            Map<String, Object> leftMessage = new HashMap<>();
            leftMessage.put("type", "userLeft");
            leftMessage.put("userId", sessionId);
            leftMessage.put("boardId", boardId);
            
            try {
                broadcastToBoard(boardId, leftMessage, sessionId);
            } catch (IOException e) {
                log.error("Error broadcasting user left message: {}", e.getMessage());
            }
            
            // Remove session from board sessions map
            Set<WebSocketSession> boardSessions = boardSessionsMap.get(boardId);
            if (boardSessions != null) {
                boardSessions.remove(session);
                
                // If no more sessions for this board, clean up the map
                if (boardSessions.isEmpty()) {
                    boardSessionsMap.remove(boardId);
                }
            }
        }
        
        // Remove from session service
        sessionService.removeSession(sessionId);
        
        log.debug("Session cleaned up: {}, board: {}", sessionId, boardId);
    }
    
    /**
     * Sends heartbeats to all connected WebSocket sessions to keep them alive
     */
    private void sendHeartbeats() {
        PingMessage ping = new PingMessage();
        
        for (Set<WebSocketSession> sessions : boardSessionsMap.values()) {
            for (WebSocketSession session : sessions) {
                try {
                    if (session.isOpen()) {
                        session.sendMessage(ping);
                    }
                } catch (IOException e) {
                    log.warn("Failed to send heartbeat to session {}: {}", session.getId(), e.getMessage());
                    try {
                        cleanupSession(session);
                    } catch (Exception ex) {
                        log.error("Error cleaning up session after heartbeat failure: {}", ex.getMessage());
                    }
                }
            }
        }
    }

    private void sendErrorMessage(WebSocketSession session, String message) throws IOException {
        Map<String, Object> errorResponse = Map.of(
            "error", message
        );
        String errorJson = objectMapper.writeValueAsString(errorResponse);
        session.sendMessage(new TextMessage(errorJson));
    }
} 