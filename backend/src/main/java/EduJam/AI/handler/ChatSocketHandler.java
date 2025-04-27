package EduJam.AI.handler;

import EduJam.AI.model.ChatMessageModel;
import EduJam.AI.model.UserSessionModel;
import EduJam.AI.service.ChatService;
import EduJam.AI.service.UserSessionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;

@Component
public class ChatSocketHandler extends TextWebSocketHandler {
    private static final Logger logger = LoggerFactory.getLogger(ChatSocketHandler.class);
    
    private final ChatService chatService;
    private final UserSessionService sessionService;
    private final ObjectMapper objectMapper;

    public ChatSocketHandler(ChatService chatService, UserSessionService sessionService, ObjectMapper objectMapper) {
        this.chatService = chatService;
        this.sessionService = sessionService;
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String sessionId = session.getId();
        sessionService.touch(sessionId);
        logger.info("WebSocket connection established for session: {}", sessionId);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String sessionId = session.getId();
        sessionService.touch(sessionId);
        logger.info("Received message from session {}: {}", sessionId, message.getPayload());

        try {
            Map<String, Object> payload = objectMapper.readValue(message.getPayload(), Map.class);
            String type = (String) payload.get("type");
            logger.info("Message type: {}", type);

            switch (type) {
                case "register":
                    handleRegister(session, payload);
                    break;
                case "message":
                    handleMessage(session, payload);
                    break;
                case "getHistory":
                    handleGetHistory(session, payload);
                    break;
                default:
                    logger.warn("Unknown message type: {}", type);
                    session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                        "error", "Unknown message type: " + type
                    ))));
            }
        } catch (Exception e) {
            logger.error("Error processing message: ", e);
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                "error", "Error processing message: " + e.getMessage()
            ))));
        }
    }

    private void handleRegister(WebSocketSession session, Map<String, Object> payload) throws Exception {
        String sessionId = (String) payload.get("sessionId");
        String username = (String) payload.get("username");
        logger.info("Handling register for session {} with username {}", sessionId, username);

        if (sessionId == null || username == null) {
            throw new IllegalArgumentException("Session ID and username are required");
        }

        UserSessionModel userSession = new UserSessionModel(username, session, null);
        sessionService.registerSession(userSession);

        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
            "type", "registered",
            "sessionId", sessionId,
            "username", username
        ))));
    }

    private void handleMessage(WebSocketSession session, Map<String, Object> payload) throws Exception {
        String sessionId = (String) payload.get("sessionId");
        String messageText = (String) payload.get("message");
        logger.info("Handling message for session {}: {}", sessionId, messageText);

        if (sessionId == null || messageText == null) {
            throw new IllegalArgumentException("Session ID and message are required");
        }

        // Create and save user message
        ChatMessageModel userMessage = new ChatMessageModel(sessionId, sessionId, messageText, true);
        chatService.saveMessage(userMessage);

        // Send user message back to client
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
            "type", "message",
            "message", Map.of(
                "content", messageText,
                "fromUser", true
            )
        ))));

        // Send typing indicator
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
            "type", "typing",
            "status", true
        ))));

        try {
            logger.info("Getting AI response for message: {}", messageText);
            // Get response from ChatGPT
            String aiReply = chatService.getChatBotReply(messageText);
            logger.info("Received AI response: {}", aiReply);

            // Create and save AI message
            ChatMessageModel aiMessage = new ChatMessageModel(sessionId, "AI", aiReply, false);
            chatService.saveMessage(aiMessage);

            // Remove typing indicator and send AI response
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                "type", "typing",
                "status", false
            ))));

            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                "type", "message",
                "message", Map.of(
                    "content", aiReply,
                    "fromUser", false
                )
            ))));
        } catch (Exception e) {
            logger.error("Error getting AI response: ", e);
            // Handle error gracefully
            ChatMessageModel errorMessage = new ChatMessageModel(
                sessionId,
                "AI",
                "Sorry, I encountered an error. Please try again.",
                false
            );
            chatService.saveMessage(errorMessage);
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                "type", "message",
                "message", Map.of(
                    "content", "Sorry, I encountered an error. Please try again.",
                    "fromUser", false
                )
            ))));
        }
    }

    private void handleGetHistory(WebSocketSession session, Map<String, Object> payload) throws Exception {
        String sessionId = (String) payload.get("sessionId");
        logger.info("Getting chat history for session: {}", sessionId);
        
        if (sessionId == null) {
            throw new IllegalArgumentException("Session ID is required");
        }

        var history = chatService.getHistory(sessionId);
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
            "type", "history",
            "messages", history
        ))));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String sessionId = session.getId();
        logger.info("WebSocket connection closed for session: {} with status: {}", sessionId, status);
        sessionService.removeSession(sessionId);
    }
} 