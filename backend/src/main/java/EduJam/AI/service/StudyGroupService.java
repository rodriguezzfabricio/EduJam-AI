package EduJam.AI.service;

import EduJam.AI.dto.StudyGroupDto;
import EduJam.AI.model.StudyGroupModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.WebSocketSession;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Service for managing study groups.
 * This class provides methods for creating, joining, and managing study groups.
 */
@Service
public class StudyGroupService {
    private static final Logger log = LoggerFactory.getLogger(StudyGroupService.class);
    
    // In-memory storage for active study groups
    private final Map<String, StudyGroupModel> activeGroups = new ConcurrentHashMap<>();
    // Map of subject -> list of group IDs for faster lookups
    private final Map<String, Map<String, String>> subjectGroupsMap = new ConcurrentHashMap<>();
    // Map of session ID -> group ID for tracking which session is in which group
    private final Map<String, String> sessionGroupMap = new ConcurrentHashMap<>();
    
    private final BoardService boardService;
    
    public StudyGroupService(BoardService boardService) {
        this.boardService = boardService;
        
        // Initialize subject maps
        subjectGroupsMap.put("Math", new ConcurrentHashMap<>());
        subjectGroupsMap.put("English", new ConcurrentHashMap<>());
        subjectGroupsMap.put("Science", new ConcurrentHashMap<>());
        subjectGroupsMap.put("Technology", new ConcurrentHashMap<>());
        subjectGroupsMap.put("Social Studies", new ConcurrentHashMap<>());
    }
    
    /**
     * Creates a new study group
     *
     * @param name the name of the study group
     * @param subject the subject of the study group
     * @param creatorId the user ID of the creator
     * @return the created study group
     */
    public StudyGroupDto createStudyGroup(String name, String subject, String creatorId) {
        String groupId = UUID.randomUUID().toString();
        
        // Create board for this group
        var board = boardService.createBoard();
        String boardId = board.getId();
        
        StudyGroupModel group = new StudyGroupModel(groupId, name, subject, boardId, creatorId);
        
        // Store in our maps
        activeGroups.put(groupId, group);
        subjectGroupsMap.get(subject).put(groupId, groupId);
        
        log.info("Created study group: {} with board: {} for subject: {}", groupId, boardId, subject);
        
        return StudyGroupDto.fromModel(group);
    }
    
    /**
     * Gets a study group by ID
     *
     * @param groupId the ID of the study group
     * @return the study group, or null if not found
     */
    public StudyGroupDto getStudyGroup(String groupId) {
        StudyGroupModel group = activeGroups.get(groupId);
        
        if (group == null) {
            return null;
        }
        
        return StudyGroupDto.fromModel(group);
    }
    
    /**
     * Gets all active study groups for a subject
     *
     * @param subject the subject to filter by
     * @return a list of study groups for the given subject
     */
    public List<StudyGroupDto> getStudyGroupsBySubject(String subject) {
        Map<String, String> subjectGroups = subjectGroupsMap.get(subject);
        
        if (subjectGroups == null) {
            log.warn("No subject found: {}", subject);
            return List.of();
        }
        
        return subjectGroups.values().stream()
                .map(activeGroups::get)
                .filter(StudyGroupModel::isActive)
                .map(StudyGroupDto::fromModel)
                .collect(Collectors.toList());
    }
    
    /**
     * Joins a user to a study group
     *
     * @param groupId the ID of the study group
     * @param userId the ID of the user
     * @param session the WebSocket session of the user
     * @return the joined study group, or null if not found or full
     */
    public StudyGroupDto joinStudyGroup(String groupId, String userId, WebSocketSession session) {
        StudyGroupModel group = activeGroups.get(groupId);
        
        if (group == null) {
            log.warn("Study group not found: {}", groupId);
            return null;
        }
        
        if (group.isFull() && !group.getParticipantIds().contains(userId)) {
            log.warn("Study group is full: {}", groupId);
            return null;
        }
        
        // Add user as participant if not already
        if (!group.getParticipantIds().contains(userId)) {
            group.addParticipant(userId);
        }
        
        // Add session to group's active sessions
        group.addSession(session);
        
        // Track which group this session is in
        sessionGroupMap.put(session.getId(), groupId);
        
        log.info("User {} joined study group {}", userId, groupId);
        
        return StudyGroupDto.fromModel(group);
    }
    
    /**
     * Handles a session being closed
     *
     * @param session the WebSocket session that was closed
     */
    public void handleSessionClosed(WebSocketSession session) {
        String sessionId = session.getId();
        String groupId = sessionGroupMap.get(sessionId);
        
        if (groupId == null) {
            return; // Session wasn't in a group
        }
        
        StudyGroupModel group = activeGroups.get(groupId);
        
        if (group == null) {
            sessionGroupMap.remove(sessionId);
            return;
        }
        
        // Remove session from group
        group.removeSession(session);
        sessionGroupMap.remove(sessionId);
        
        log.info("Removed session {} from study group {}", sessionId, groupId);
        
        // If group is empty, mark it as inactive and remove it from subject map
        if (group.isEmpty()) {
            group.setActive(false);
            subjectGroupsMap.get(group.getSubject()).remove(groupId);
            activeGroups.remove(groupId);
            log.info("Study group {} is empty, marked as inactive and removed", groupId);
        }
    }
    
    /**
     * Gets the study group for a session
     *
     * @param session the WebSocket session
     * @return the study group, or null if not found
     */
    public StudyGroupModel getGroupForSession(WebSocketSession session) {
        String groupId = sessionGroupMap.get(session.getId());
        
        if (groupId == null) {
            return null;
        }
        
        return activeGroups.get(groupId);
    }
    
    /**
     * Leaves a study group
     *
     * @param groupId the ID of the study group
     * @param userId the ID of the user
     * @param session the WebSocket session of the user
     * @return true if the user successfully left the group
     */
    public boolean leaveStudyGroup(String groupId, String userId, WebSocketSession session) {
        StudyGroupModel group = activeGroups.get(groupId);
        
        if (group == null) {
            return false;
        }
        
        // Remove user as participant
        group.removeParticipant(userId);
        
        // Remove session from group
        group.removeSession(session);
        sessionGroupMap.remove(session.getId());
        
        log.info("User {} left study group {}", userId, groupId);
        
        // If group is empty, mark it as inactive and remove it from subject map
        if (group.isEmpty()) {
            group.setActive(false);
            subjectGroupsMap.get(group.getSubject()).remove(groupId);
            activeGroups.remove(groupId);
            log.info("Study group {} is empty, marked as inactive and removed", groupId);
        }
        
        return true;
    }
} 