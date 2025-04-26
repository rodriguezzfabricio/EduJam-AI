package EduJam.AI.dto;

import java.util.List;

/**
 * Data Transfer Object for Board, used to transport board information
 * over WebSockets and REST endpoints.
 */
public class BoardDto {
    private String id;
    private List<StrokeDto> strokes;
    private int width;
    private int height;
    private String backgroundColor;
    private boolean showGrid;
    private int gridSize;

    // Default constructor
    public BoardDto() {
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public List<StrokeDto> getStrokes() {
        return strokes;
    }

    public void setStrokes(List<StrokeDto> strokes) {
        this.strokes = strokes;
    }

    public int getWidth() {
        return width;
    }

    public void setWidth(int width) {
        this.width = width;
    }

    public int getHeight() {
        return height;
    }

    public void setHeight(int height) {
        this.height = height;
    }

    public String getBackgroundColor() {
        return backgroundColor;
    }

    public void setBackgroundColor(String backgroundColor) {
        this.backgroundColor = backgroundColor;
    }

    public boolean isShowGrid() {
        return showGrid;
    }

    public void setShowGrid(boolean showGrid) {
        this.showGrid = showGrid;
    }

    public int getGridSize() {
        return gridSize;
    }

    public void setGridSize(int gridSize) {
        this.gridSize = gridSize;
    }
} 