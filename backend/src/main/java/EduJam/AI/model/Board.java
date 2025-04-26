package EduJam.AI.model;

import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicInteger;

public class Board {
    private final String id;
    private final String creatorId;
    private final LocalDateTime createdAt;
    private int canvasWidth;
    private int canvasHeight;
    private String backgroundColor;
    private final AtomicInteger strokeCount;

    public Board(String id, String creatorId) {
        this.id = id;
        this.creatorId = creatorId;
        this.createdAt = LocalDateTime.now();
        this.canvasWidth = 1200; // Default width
        this.canvasHeight = 800; // Default height
        this.backgroundColor = "#FFFFFF"; // Default white background
        this.strokeCount = new AtomicInteger(0);
    }

    public String getId() {
        return id;
    }

    public String getCreatorId() {
        return creatorId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public int getCanvasWidth() {
        return canvasWidth;
    }

    public void setCanvasWidth(int canvasWidth) {
        this.canvasWidth = canvasWidth;
    }

    public int getCanvasHeight() {
        return canvasHeight;
    }

    public void setCanvasHeight(int canvasHeight) {
        this.canvasHeight = canvasHeight;
    }

    public String getBackgroundColor() {
        return backgroundColor;
    }

    public void setBackgroundColor(String backgroundColor) {
        this.backgroundColor = backgroundColor;
    }

    public int getStrokeCount() {
        return strokeCount.get();
    }

    public void incrementStrokeCount() {
        this.strokeCount.incrementAndGet();
    }

    public void decrementStrokeCount() {
        this.strokeCount.decrementAndGet();
    }

    public void resetStrokeCount() {
        this.strokeCount.set(0);
    }
} 