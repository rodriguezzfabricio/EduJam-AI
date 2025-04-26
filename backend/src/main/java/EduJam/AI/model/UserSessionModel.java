package EduJam.AI.model;

import org.springframework.web.socket.WebSocketSession;
import java.time.Duration;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * Tracks a user's WebSocket sessions for both the shared whiteboard
 * and private ChatGPT interactions.
 */
public class UserSessionModel {
    
    private final String sessionId;
    private String username;
    private WebSocketSession boardSession;
    private WebSocketSession chatSession;
    private Instant lastActivity;

    public static final Duration DEFAULT_TIMEOUT = Duration.ofMinutes(30);
    
    /**
     * Default constructor.
     */
    public UserSessionModel() {
        this.sessionId = UUID.randomUUID().toString();
        this.lastActivity = Instant.now();
    }
    
    /**
     * Constructs a new user session with all fields.
     *
     * @param username Display name of the user
     */
    public UserSessionModel(String username) {
        this();
        this.username = username;
    }
    
    /**
     * Constructs a new user session with all fields.
     *
     * @param username Display name of the user
     * @param boardSession The active WebSocket session for live board updates
     * @param chatSession The active WebSocket session for the private ChatGPT chat
     */
    public UserSessionModel(String username, WebSocketSession boardSession, WebSocketSession chatSession) {
        this(username);
        this.boardSession = boardSession;
        this.chatSession = chatSession;
    }
    
    /**
     * Gets the session ID.
     *
     * @return Unique ID of the user session
     */
    public String getSessionId() {
        return sessionId;
    }
    
    /**
     * Gets the username.
     *
     * @return Display name of the user
     */
    public String getUsername() {
        return username;
    }
    
    /**
     * Sets the username.
     *
     * @param username Display name of the user
     */
    public void setUsername(String username) {
        this.username = username;
    }
    
    /**
     * Gets the board WebSocket session.
     *
     * @return The active WebSocket session for live board updates
     */
    public WebSocketSession getBoardSession() {
        return boardSession;
    }
    
    /**
     * Sets the board WebSocket session.
     *
     * @param boardSession The active WebSocket session for live board updates
     */
    public void setBoardSession(WebSocketSession boardSession) {
        this.boardSession = boardSession;
    }
    
    /**
     * Gets the chat WebSocket session.
     *
     * @return The active WebSocket session for the private ChatGPT chat
     */
    public WebSocketSession getChatSession() {
        return chatSession;
    }
    
    /**
     * Sets the chat WebSocket session.
     *
     * @param chatSession The active WebSocket session for the private ChatGPT chat
     */
    public void setChatSession(WebSocketSession chatSession) {
        this.chatSession = chatSession;
    }
    
    /**
     * Gets the last activity time.
     *
     * @return The last activity time
     */
    public Instant getLastActivity() {
        return lastActivity;
    }
    
    /**
     * Updates the last activity time.
     */
    public void updateActivity() {
        this.lastActivity = Instant.now();
    }
    
    /**
     * Checks if the user session is expired.
     *
     * @param timeout The timeout duration
     * @return true if the session is expired, false otherwise
     */
    public boolean isExpired(Duration timeout) {
        return Duration.between(lastActivity, Instant.now()).compareTo(timeout) > 0;
    }
    
    /**
     * Checks if the user has an active board session.
     *
     * @return true if the board session is open, false otherwise
     */
    public boolean hasActiveBoardSession() {
        return boardSession != null && boardSession.isOpen();
    }
    
    /**
     * Checks if the user has an active chat session.
     *
     * @return true if the chat session is open, false otherwise
     */
    public boolean hasActiveChatSession() {
        return chatSession != null && chatSession.isOpen();
    }
    
    /**
     * Closes all active sessions.
     */
    public void closeSessions() {
        try {
            if (boardSession != null && boardSession.isOpen()) boardSession.close();
        } catch (Exception ignored) {}
        try {
            if (chatSession != null && chatSession.isOpen()) chatSession.close();
        } catch (Exception ignored) {}
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserSessionModel that = (UserSessionModel) o;
        return Objects.equals(sessionId, that.sessionId);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(sessionId);
    }
    
    @Override
    public String toString() {
        return "UserSessionModel{" +
                "sessionId='" + sessionId + '\'' +
                ", username='" + username + '\'' +
                ", boardSessionActive=" + hasActiveBoardSession() +
                ", chatSessionActive=" + hasActiveChatSession() +
                ", lastActivity=" + lastActivity +
                '}';
    }
} 