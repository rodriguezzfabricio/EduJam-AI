package EduJam.AI.handler;

import EduJam.AI.model.ChatMessageModel;
import EduJam.AI.model.UserSessionModel;
import EduJam.AI.service.ChatService;
import EduJam.AI.service.UserSessionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;

@Component
public class ChatSocketHandler extends TextWebSocketHandler {
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
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String sessionId = session.getId();
        sessionService.touch(sessionId);

        try {
            Map<String, Object> payload = objectMapper.readValue(message.getPayload(), Map.class);
            String type = (String) payload.get("type");

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
                    session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                        "error", "Unknown message type: " + type
                    ))));
            }
        } catch (Exception e) {
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                "error", "Error processing message: " + e.getMessage()
            ))));
        }
    }

    private void handleRegister(WebSocketSession session, Map<String, Object> payload) throws Exception {
        String sessionId = (String) payload.get("sessionId");
        String username = (String) payload.get("username");

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

        if (sessionId == null || messageText == null) {
            throw new IllegalArgumentException("Session ID and message are required");
        }

        // Create and save user message
        ChatMessageModel userMessage = new ChatMessageModel(sessionId, sessionId, messageText, true);
        chatService.saveMessage(userMessage);

        // Send user message back to client
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
            "type", "message",
            "message", userMessage
        ))));

        // Create placeholder AI response
        ChatMessageModel aiResponse = new ChatMessageModel(
            sessionId,
            "AI",
            "This is a placeholder response. OpenAI integration coming soon!",
            false
        );
        chatService.saveMessage(aiResponse);

        // Send AI response to client
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
            "type", "message",
            "message", aiResponse
        ))));
    }

    private void handleGetHistory(WebSocketSession session, Map<String, Object> payload) throws Exception {
        String sessionId = (String) payload.get("sessionId");
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
        sessionService.removeSession(sessionId);
    }
} 