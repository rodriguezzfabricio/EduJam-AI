package EduJam.AI.model;

import java.util.Objects;
import java.time.Instant;
import java.util.UUID;

/**
 * Represents a chat message in a user's private chat.
 * Each message can be from either the user or ChatGPT.
 */
public class ChatMessageModel {
    
    private String id;
    private String sessionId;
    private Instant timestamp;
    private String senderId;
    private String message;
    private boolean fromUser;
    
    /**
     * Default constructor.
     */
    public ChatMessageModel() {
        this.id = UUID.randomUUID().toString();
        this.timestamp = Instant.now();
    }
    
    /**
     * Constructs a new chat message with all fields.
     *
     * @param sessionId The unique ID of the session
     * @param senderId The unique ID of the sender
     * @param message The text content of the message
     * @param fromUser True if it's a user's message, False if it's a ChatGPT response
     */
    public ChatMessageModel(String sessionId, String senderId, String message, boolean fromUser) {
        this();
        this.sessionId = sessionId;
        this.senderId = senderId;
        this.message = message;
        this.fromUser = fromUser;
    }
    
    /**
     * Gets the message ID.
     *
     * @return The unique ID of the message
     */
    public String getId() {
        return id;
    }
    
    /**
     * Gets the session ID.
     *
     * @return The unique ID of the session
     */
    public String getSessionId() {
        return sessionId;
    }
    
    /**
     * Sets the session ID.
     *
     * @param sessionId The unique ID of the session
     */
    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
    
    /**
     * Gets the timestamp of the message.
     *
     * @return The timestamp of the message
     */
    public Instant getTimestamp() {
        return timestamp;
    }
    
    /**
     * Sets the timestamp of the message.
     *
     * @param timestamp The timestamp of the message
     */
    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
    
    /**
     * Gets the sender ID.
     *
     * @return The unique ID of the sender
     */
    public String getSenderId() {
        return senderId;
    }
    
    /**
     * Sets the sender ID.
     *
     * @param senderId The unique ID of the sender
     */
    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }
    
    /**
     * Gets the message text.
     *
     * @return The text content of the message
     */
    public String getMessage() {
        return message;
    }
    
    /**
     * Sets the message text.
     *
     * @param message The text content of the message
     */
    public void setMessage(String message) {
        this.message = message;
    }
    
    /**
     * Checks if the message is from the user.
     *
     * @return True if it's a user's message, False if it's a ChatGPT response
     */
    public boolean isFromUser() {
        return fromUser;
    }
    
    /**
     * Sets whether the message is from the user.
     *
     * @param fromUser True if it's a user's message, False if it's a ChatGPT response
     */
    public void setFromUser(boolean fromUser) {
        this.fromUser = fromUser;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ChatMessageModel that = (ChatMessageModel) o;
        return fromUser == that.fromUser &&
                Objects.equals(id, that.id) &&
                Objects.equals(sessionId, that.sessionId) &&
                Objects.equals(senderId, that.senderId) &&
                Objects.equals(message, that.message) &&
                Objects.equals(timestamp, that.timestamp);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id, sessionId, senderId, message, fromUser, timestamp);
    }
    
    @Override
    public String toString() {
        return "ChatMessageModel{" +
                "id='" + id + '\'' +
                ", sessionId='" + sessionId + '\'' +
                ", senderId='" + senderId + '\'' +
                ", message='" + message + '\'' +
                ", fromUser=" + fromUser +
                ", timestamp=" + timestamp +
                '}';
    }
} 