package EduJam.AI.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.socket.WebSocketSession;

import java.time.Instant;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Model representing a study group.
 * This class stores information about a study group, including its board.
 */
@Data
@NoArgsConstructor
public class StudyGroupModel {
    private String id;
    private String name;
    private String subject; // Math, English, Science, Technology, Social Studies
    private String boardId;
    private String creatorId;
    private Instant createdAt;
    private int maxParticipants = 10;
    private Set<String> participantIds = ConcurrentHashMap.newKeySet();
    private Set<WebSocketSession> activeSessions = ConcurrentHashMap.newKeySet();
    private boolean active = true;

    public StudyGroupModel(String id, String name, String subject, String boardId, String creatorId) {
        this.id = id;
        this.name = name;
        this.subject = subject;
        this.boardId = boardId;
        this.creatorId = creatorId;
        this.createdAt = Instant.now();
        this.participantIds.add(creatorId); // Creator is automatically a participant
    }

    /**
     * Adds a participant to the study group
     *
     * @param userId the user ID to add
     * @return true if the participant was added, false if the group is full
     */
    public boolean addParticipant(String userId) {
        if (participantIds.size() >= maxParticipants) {
            return false; // Group is full
        }
        return participantIds.add(userId);
    }

    /**
     * Adds a WebSocket session to the study group's active sessions
     *
     * @param session the WebSocket session to add
     * @return true if the session was added
     */
    public boolean addSession(WebSocketSession session) {
        return activeSessions.add(session);
    }

    /**
     * Removes a WebSocket session from the study group's active sessions
     *
     * @param session the WebSocket session to remove
     * @return true if the session was removed
     */
    public boolean removeSession(WebSocketSession session) {
        return activeSessions.remove(session);
    }

    /**
     * Removes a participant from the study group
     *
     * @param userId the user ID to remove
     * @return true if the participant was removed
     */
    public boolean removeParticipant(String userId) {
        return participantIds.remove(userId);
    }

    /**
     * Checks if the study group has active participants
     *
     * @return true if the study group has no active participants
     */
    public boolean isEmpty() {
        return activeSessions.isEmpty();
    }

    /**
     * Checks if the study group is full
     *
     * @return true if the study group is full
     */
    public boolean isFull() {
        return participantIds.size() >= maxParticipants;
    }
    
    // Make sure these getter and setter methods are explicitly defined
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getSubject() {
        return subject;
    }
    
    public void setSubject(String subject) {
        this.subject = subject;
    }
    
    public String getBoardId() {
        return boardId;
    }
    
    public void setBoardId(String boardId) {
        this.boardId = boardId;
    }
    
    public String getCreatorId() {
        return creatorId;
    }
    
    public void setCreatorId(String creatorId) {
        this.creatorId = creatorId;
    }
    
    public Instant getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
    
    public int getMaxParticipants() {
        return maxParticipants;
    }
    
    public void setMaxParticipants(int maxParticipants) {
        this.maxParticipants = maxParticipants;
    }
    
    public Set<String> getParticipantIds() {
        return participantIds;
    }
    
    public void setParticipantIds(Set<String> participantIds) {
        this.participantIds = participantIds;
    }
    
    public Set<WebSocketSession> getActiveSessions() {
        return activeSessions;
    }
    
    public void setActiveSessions(Set<WebSocketSession> activeSessions) {
        this.activeSessions = activeSessions;
    }
    
    public boolean isActive() {
        return active;
    }
    
    public void setActive(boolean active) {
        this.active = active;
    }
} 