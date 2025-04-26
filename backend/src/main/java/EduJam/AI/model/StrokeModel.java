package EduJam.AI.model;

import java.time.Instant;
import java.util.UUID;

/**
 * Represents a stroke drawn on a canvas with start and end coordinates,
 * color, and brush size information. This model is used to track drawing
 * operations in the application.
 */
public class StrokeModel {
    private String id;
    private String boardId;
    private String userId;
    private Instant timestamp;
    private double startX;
    private double startY;
    private double endX;
    private double endY;
    private String color;
    private int size;

    /**
     * Default constructor. Creates an empty stroke model with generated ID and current timestamp.
     */
    public StrokeModel() {
        this.id = UUID.randomUUID().toString();
        this.timestamp = Instant.now();
    }

    /**
     * Creates a new stroke model with the specified parameters.
     */
    public StrokeModel(String boardId, String userId, double startX, double startY, 
                      double endX, double endY, String color, int size) {
        this();
        setBoardId(boardId);
        setUserId(userId);
        setStartX(startX);
        setStartY(startY);
        setEndX(endX);
        setEndY(endY);
        setColor(color);
        setSize(size);
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public String getBoardId() {
        return boardId;
    }

    public void setBoardId(String boardId) {
        if (boardId == null || boardId.trim().isEmpty()) {
            throw new IllegalArgumentException("Board ID cannot be null or empty");
        }
        this.boardId = boardId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }
        this.userId = userId;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        if (timestamp == null) {
            throw new IllegalArgumentException("Timestamp cannot be null");
        }
        this.timestamp = timestamp;
    }

    public double getStartX() {
        return startX;
    }

    public void setStartX(double startX) {
        this.startX = startX;
    }

    public double getStartY() {
        return startY;
    }

    public void setStartY(double startY) {
        this.startY = startY;
    }

    public double getEndX() {
        return endX;
    }

    public void setEndX(double endX) {
        this.endX = endX;
    }

    public double getEndY() {
        return endY;
    }

    public void setEndY(double endY) {
        this.endY = endY;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        if (color == null || color.trim().isEmpty()) {
            throw new IllegalArgumentException("Color cannot be null or empty");
        }
        this.color = color;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        if (size <= 0) {
            throw new IllegalArgumentException("Brush size must be greater than 0");
        }
        this.size = size;
    }

    @Override
    public String toString() {
        return "StrokeModel{" +
                "id='" + id + '\'' +
                ", boardId='" + boardId + '\'' +
                ", userId='" + userId + '\'' +
                ", timestamp=" + timestamp +
                ", startX=" + startX +
                ", startY=" + startY +
                ", endX=" + endX +
                ", endY=" + endY +
                ", color='" + color + '\'' +
                ", size=" + size +
                '}';
    }
}
