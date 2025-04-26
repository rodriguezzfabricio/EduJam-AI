package EduJam.AI.model;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Represents a stroke drawn on a canvas with a series of points,
 * color, and brush size information. This model is used to track drawing
 * operations in the application.
 */
public class StrokeModel {
    private String id;
    private String boardId;
    private String sessionId;
    private List<Map<String, Integer>> points;
    private String color;
    private int thickness;
    private String tool;
    private long timestamp;

    /**
     * Default constructor. Creates an empty stroke model with generated ID, current timestamp,
     * and an empty points list.
     */
    public StrokeModel() {
        this.id = UUID.randomUUID().toString();
        this.timestamp = System.currentTimeMillis();
    }

    /**
     * Creates a new stroke model with the specified parameters.
     */
    public StrokeModel(String boardId, String sessionId, List<Map<String, Integer>> points, 
                       String color, int thickness, String tool) {
        this.id = UUID.randomUUID().toString();
        this.boardId = boardId;
        this.sessionId = sessionId;
        this.points = points;
        this.color = color;
        this.thickness = thickness;
        this.tool = tool;
        this.timestamp = System.currentTimeMillis();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getBoardId() {
        return boardId;
    }

    public void setBoardId(String boardId) {
        this.boardId = boardId;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public List<Map<String, Integer>> getPoints() {
        return points;
    }

    public void setPoints(List<Map<String, Integer>> points) {
        this.points = points;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public int getThickness() {
        return thickness;
    }

    public void setThickness(int thickness) {
        this.thickness = thickness;
    }

    public String getTool() {
        return tool;
    }

    public void setTool(String tool) {
        this.tool = tool;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "StrokeModel{" +
                "id='" + id + '\'' +
                ", boardId='" + boardId + '\'' +
                ", sessionId='" + sessionId + '\'' +
                ", points=" + points +
                ", color='" + color + '\'' +
                ", thickness=" + thickness +
                ", tool='" + tool + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}
