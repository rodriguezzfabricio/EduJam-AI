package EduJam.AI.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Data Transfer Object for Stroke, used to transport stroke information
 * over WebSockets and REST endpoints.
 */
public class StrokeDto {
    private String id;
    private String boardId;
    private List<Map<String, Integer>> points;
    private String color;
    private int width;
    private long timestamp;

    // Default constructor
    public StrokeDto() {
        this.points = new ArrayList<>();
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

    public int getWidth() {
        return width;
    }

    public void setWidth(int width) {
        this.width = width;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
} 