package EduJam.AI.handler;

import EduJam.AI.dto.StudyGroupDto;
import EduJam.AI.model.StudyGroupModel;
import EduJam.AI.service.StudyGroupService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * WebSocket handler for study group operations.
 * This handler manages real-time interactions between users in study groups.
 */
@Component
public class StudyGroupSocketHandler extends TextWebSocketHandler {
    private static final Logger log = LoggerFactory.getLogger(StudyGroupSocketHandler.class);
    private static final long HEARTBEAT_INTERVAL_MS = 30000; // 30 seconds
    
    private final StudyGroupService studyGroupService;
    private final ObjectMapper objectMapper;
    private final Map<String, WebSocketSession> allSessions = new ConcurrentHashMap<>();
    private final ScheduledExecutorService heartbeatScheduler = Executors.newSingleThreadScheduledExecutor();
    
    public StudyGroupSocketHandler(StudyGroupService studyGroupService, ObjectMapper objectMapper) {
        this.studyGroupService = studyGroupService;
        this.objectMapper = objectMapper;
        
        // Start the heartbeat scheduler
        heartbeatScheduler.scheduleAtFixedRate(this::sendHeartbeats, HEARTBEAT_INTERVAL_MS, HEARTBEAT_INTERVAL_MS, TimeUnit.MILLISECONDS);
    }
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        log.info("Study Group WebSocket connection established: {}", session.getId());
        
        allSessions.put(session.getId(), session);
        
        // Check if the session has authentication info
        Map<String, Object> attributes = session.getAttributes();
        Boolean authenticated = (Boolean) attributes.get("authenticated");
        
        if (authenticated != null && authenticated) {
            String userId = (String) attributes.get("userId");
            log.info("Authenticated user connected: {}", userId);
        } else {
            log.warn("Non-authenticated user connected");
        }
    }
    
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        log.info("Received message: {}", payload);
        
        JsonNode jsonNode = objectMapper.readTree(payload);
        String type = jsonNode.get("type").asText();
        
        // Get user ID from session attributes
        String userId = (String) session.getAttributes().get("userId");
        
        if (userId == null) {
            log.warn("Message from non-authenticated session: {}", session.getId());
            sendErrorMessage(session, "Authentication required");
            return;
        }
        
        switch (type) {
            case "listSubjects":
                handleListSubjects(session);
                break;
            case "listGroupsBySubject":
                handleListGroupsBySubject(session, jsonNode);
                break;
            case "createGroup":
                handleCreateGroup(session, jsonNode, userId);
                break;
            case "joinGroup":
                handleJoinGroup(session, jsonNode, userId);
                break;
            case "leaveGroup":
                handleLeaveGroup(session, jsonNode, userId);
                break;
            case "sendGroupChatMessage":
                handleSendGroupChatMessage(session, jsonNode, userId);
                break;
            case "ping":
                // Client ping, respond with pong
                sendPong(session);
                break;
            default:
                log.warn("Unknown message type: {}", type);
                sendErrorMessage(session, "Unknown message type: " + type);
        }
    }
    
    private void handleListSubjects(WebSocketSession session) throws IOException {
        Map<String, Object> response = new HashMap<>();
        response.put("type", "subjectsList");
        response.put("subjects", List.of("Math", "English", "Science", "Technology", "Social Studies"));
        
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
    }
    
    private void handleListGroupsBySubject(WebSocketSession session, JsonNode jsonNode) throws IOException {
        String subject = jsonNode.get("subject").asText();
        log.info("Listing groups for subject: {}", subject);
        
        List<StudyGroupDto> groups = studyGroupService.getStudyGroupsBySubject(subject);
        
        Map<String, Object> response = new HashMap<>();
        response.put("type", "groupsList");
        response.put("subject", subject);
        response.put("groups", groups);
        
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
    }
    
    private void handleCreateGroup(WebSocketSession session, JsonNode jsonNode, String userId) throws IOException {
        String name = jsonNode.get("name").asText();
        String subject = jsonNode.get("subject").asText();
        
        log.info("Creating group '{}' for subject '{}' by user '{}'", name, subject, userId);
        
        StudyGroupDto group = studyGroupService.createStudyGroup(name, subject, userId);
        
        // Join the creator to the group
        studyGroupService.joinStudyGroup(group.getId(), userId, session);
        
        Map<String, Object> response = new HashMap<>();
        response.put("type", "groupCreated");
        response.put("group", group);
        
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
        
        // Notify others in the same subject that a new group is available
        broadcastGroupListUpdate(subject);
    }
    
    private void handleJoinGroup(WebSocketSession session, JsonNode jsonNode, String userId) throws IOException {
        String groupId = jsonNode.get("groupId").asText();
        
        log.info("User '{}' joining group '{}'", userId, groupId);
        
        StudyGroupDto group = studyGroupService.joinStudyGroup(groupId, userId, session);
        
        if (group == null) {
            sendErrorMessage(session, "Failed to join group: Group not found or full");
            return;
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("type", "groupJoined");
        response.put("group", group);
        
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
        
        // Notify others in the group that a new user joined
        notifyGroupMembersExcept(group.getId(), Map.of(
            "type", "userJoined",
            "groupId", groupId,
            "userId", userId
        ), session.getId());
        
        // Notify others watching the subject that the group participation changed
        broadcastGroupListUpdate(group.getSubject());
    }
    
    private void handleLeaveGroup(WebSocketSession session, JsonNode jsonNode, String userId) throws IOException {
        String groupId = jsonNode.get("groupId").asText();
        
        log.info("User '{}' leaving group '{}'", userId, groupId);
        
        StudyGroupDto groupBeforeLeave = studyGroupService.getStudyGroup(groupId);
        
        if (groupBeforeLeave == null) {
            sendErrorMessage(session, "Group not found");
            return;
        }
        
        String subject = groupBeforeLeave.getSubject();
        
        boolean success = studyGroupService.leaveStudyGroup(groupId, userId, session);
        
        if (!success) {
            sendErrorMessage(session, "Failed to leave group");
            return;
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("type", "groupLeft");
        response.put("groupId", groupId);
        
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
        
        // Only notify others if the group still exists
        StudyGroupDto groupAfterLeave = studyGroupService.getStudyGroup(groupId);
        if (groupAfterLeave != null) {
            // Notify others in the group that a user left
            notifyGroupMembersExcept(groupId, Map.of(
                "type", "userLeft",
                "groupId", groupId,
                "userId", userId
            ), session.getId());
        }
        
        // Notify others watching the subject that the group participation changed
        broadcastGroupListUpdate(subject);
    }
    
    private void handleSendGroupChatMessage(WebSocketSession session, JsonNode jsonNode, String userId) throws IOException {
        String groupId = jsonNode.get("groupId").asText();
        String message = jsonNode.get("message").asText();
        
        log.info("User '{}' sending message to group '{}'", userId, groupId);
        
        StudyGroupModel group = studyGroupService.getGroupForSession(session);
        
        if (group == null || !group.getId().equals(groupId)) {
            sendErrorMessage(session, "You are not in this group");
            return;
        }
        
        // Broadcast the message to all group members
        notifyGroupMembers(groupId, Map.of(
            "type", "groupChatMessage",
            "groupId", groupId,
            "userId", userId,
            "message", message,
            "timestamp", System.currentTimeMillis()
        ));
    }
    
    private void broadcastGroupListUpdate(String subject) {
        log.info("Broadcasting group list update for subject: {}", subject);
        
        List<StudyGroupDto> groups = studyGroupService.getStudyGroupsBySubject(subject);
        
        // Prepare the update message
        Map<String, Object> updateMessage = new HashMap<>();
        updateMessage.put("type", "groupsListUpdate");
        updateMessage.put("subject", subject);
        updateMessage.put("groups", groups);
        
        // Send to all sessions
        try {
            String updateJson = objectMapper.writeValueAsString(updateMessage);
            for (WebSocketSession session : allSessions.values()) {
                if (session.isOpen()) {
                    session.sendMessage(new TextMessage(updateJson));
                }
            }
        } catch (IOException e) {
            log.error("Error broadcasting group list update", e);
        }
    }
    
    private void notifyGroupMembers(String groupId, Map<String, Object> message) {
        StudyGroupModel group = studyGroupService.getGroupForSession(allSessions.values().iterator().next());
        
        if (group == null || !group.getId().equals(groupId)) {
            log.warn("Cannot notify group members: group not found or session not in group");
            return;
        }
        
        try {
            String messageJson = objectMapper.writeValueAsString(message);
            for (WebSocketSession session : group.getActiveSessions()) {
                if (session.isOpen()) {
                    session.sendMessage(new TextMessage(messageJson));
                }
            }
        } catch (IOException e) {
            log.error("Error notifying group members", e);
        }
    }
    
    private void notifyGroupMembersExcept(String groupId, Map<String, Object> message, String excludeSessionId) {
        StudyGroupModel group = studyGroupService.getGroupForSession(allSessions.values().iterator().next());
        
        if (group == null || !group.getId().equals(groupId)) {
            log.warn("Cannot notify group members: group not found or session not in group");
            return;
        }
        
        try {
            String messageJson = objectMapper.writeValueAsString(message);
            for (WebSocketSession session : group.getActiveSessions()) {
                if (session.isOpen() && !session.getId().equals(excludeSessionId)) {
                    session.sendMessage(new TextMessage(messageJson));
                }
            }
        } catch (IOException e) {
            log.error("Error notifying group members", e);
        }
    }
    
    private void sendHeartbeats() {
        for (WebSocketSession session : allSessions.values()) {
            if (session.isOpen()) {
                try {
                    session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of("type", "ping"))));
                } catch (IOException e) {
                    log.warn("Error sending heartbeat to session: {}", session.getId(), e);
                }
            }
        }
    }
    
    private void sendPong(WebSocketSession session) throws IOException {
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of("type", "pong"))));
    }
    
    private void sendErrorMessage(WebSocketSession session, String errorMessage) throws IOException {
        Map<String, Object> error = new HashMap<>();
        error.put("type", "error");
        error.put("message", errorMessage);
        
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(error)));
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        log.info("Study Group WebSocket connection closed: {}", session.getId());
        
        // Remove from active sessions
        allSessions.remove(session.getId());
        
        // Handle session closing in study group service
        studyGroupService.handleSessionClosed(session);
    }
    
    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.error("Transport error in study group WebSocket", exception);
    }
} 