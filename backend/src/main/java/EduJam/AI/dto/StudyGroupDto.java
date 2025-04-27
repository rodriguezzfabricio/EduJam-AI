package EduJam.AI.dto;

import EduJam.AI.model.StudyGroupModel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

/**
 * Data Transfer Object for Study Group information.
 * This class is used to send study group information to clients.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudyGroupDto {
    private String id;
    private String name;
    private String subject;
    private String boardId;
    private String creatorId;
    private Instant createdAt;
    private int maxParticipants;
    private int currentParticipants;
    private Set<String> participantIds = new HashSet<>();
    private boolean active;
    private boolean full;

    /**
     * Creates a StudyGroupDto from a StudyGroupModel
     *
     * @param model the StudyGroupModel to convert
     * @return a new StudyGroupDto
     */
    public static StudyGroupDto fromModel(StudyGroupModel model) {
        StudyGroupDto dto = new StudyGroupDto();
        dto.setId(model.getId());
        dto.setName(model.getName());
        dto.setSubject(model.getSubject());
        dto.setBoardId(model.getBoardId());
        dto.setCreatorId(model.getCreatorId());
        dto.setCreatedAt(model.getCreatedAt());
        dto.setMaxParticipants(model.getMaxParticipants());
        dto.setCurrentParticipants(model.getParticipantIds().size());
        dto.setParticipantIds(new HashSet<>(model.getParticipantIds()));
        dto.setActive(model.isActive());
        dto.setFull(model.isFull());
        return dto;
    }

    /**
     * Gets the study group ID
     *
     * @return the ID
     */
    public String getId() {
        return id;
    }

    /**
     * Sets the study group ID
     *
     * @param id the ID to set
     */
    public void setId(String id) {
        this.id = id;
    }

    /**
     * Gets the study group name
     *
     * @return the name
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the study group name
     *
     * @param name the name to set
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Gets the study group subject
     *
     * @return the subject
     */
    public String getSubject() {
        return subject;
    }

    /**
     * Sets the study group subject
     *
     * @param subject the subject to set
     */
    public void setSubject(String subject) {
        this.subject = subject;
    }

    /**
     * Gets the board ID
     *
     * @return the board ID
     */
    public String getBoardId() {
        return boardId;
    }

    /**
     * Sets the board ID
     *
     * @param boardId the board ID to set
     */
    public void setBoardId(String boardId) {
        this.boardId = boardId;
    }

    /**
     * Gets the creator ID
     *
     * @return the creator ID
     */
    public String getCreatorId() {
        return creatorId;
    }

    /**
     * Sets the creator ID
     *
     * @param creatorId the creator ID to set
     */
    public void setCreatorId(String creatorId) {
        this.creatorId = creatorId;
    }

    /**
     * Gets the created at timestamp
     *
     * @return the created at timestamp
     */
    public Instant getCreatedAt() {
        return createdAt;
    }

    /**
     * Sets the created at timestamp
     *
     * @param createdAt the created at timestamp to set
     */
    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    /**
     * Gets the maximum number of participants
     *
     * @return the maximum number of participants
     */
    public int getMaxParticipants() {
        return maxParticipants;
    }

    /**
     * Sets the maximum number of participants
     *
     * @param maxParticipants the maximum number of participants to set
     */
    public void setMaxParticipants(int maxParticipants) {
        this.maxParticipants = maxParticipants;
    }

    /**
     * Gets the current number of participants
     *
     * @return the current number of participants
     */
    public int getCurrentParticipants() {
        return currentParticipants;
    }

    /**
     * Sets the current number of participants
     *
     * @param currentParticipants the current number of participants to set
     */
    public void setCurrentParticipants(int currentParticipants) {
        this.currentParticipants = currentParticipants;
    }

    /**
     * Gets the participant IDs
     *
     * @return the participant IDs
     */
    public Set<String> getParticipantIds() {
        return participantIds;
    }

    /**
     * Sets the participant IDs
     *
     * @param participantIds the participant IDs to set
     */
    public void setParticipantIds(Set<String> participantIds) {
        this.participantIds = participantIds;
    }

    /**
     * Checks if the study group is active
     *
     * @return true if active
     */
    public boolean isActive() {
        return active;
    }

    /**
     * Sets whether the study group is active
     *
     * @param active true if active
     */
    public void setActive(boolean active) {
        this.active = active;
    }

    /**
     * Checks if the study group is full
     *
     * @return true if full
     */
    public boolean isFull() {
        return full;
    }

    /**
     * Sets whether the study group is full
     *
     * @param full true if full
     */
    public void setFull(boolean full) {
        this.full = full;
    }
} 