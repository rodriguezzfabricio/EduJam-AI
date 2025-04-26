package EduJam.AI.model;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.Stack;
import java.util.UUID;

/**
 * Thread-safe model representing a collaborative whiteboard.
 * Uses CopyOnWriteArrayList for thread-safe stroke operations.
 */
public class BoardModel {
    // Use CopyOnWriteArrayList for thread-safe operations
    private final List<StrokeModel> strokes;
    private final Stack<StrokeModel> undoStack;
    private final Stack<StrokeModel> redoStack;
    
    // Board settings
    private int width;
    private int height;
    private String backgroundColor;
    private boolean showGrid;
    private int gridSize;
    private final String id;

    public BoardModel() {
        this.strokes = new CopyOnWriteArrayList<>();
        this.undoStack = new Stack<>();
        this.redoStack = new Stack<>();
        
        // Default board settings
        this.width = 800;
        this.height = 600;
        this.backgroundColor = "#FFFFFF";
        this.showGrid = false;
        this.gridSize = 20;
        this.id = UUID.randomUUID().toString();
    }

    /**
     * Thread-safe method to get all strokes
     */
    public List<StrokeModel> getStrokes() {
        return new ArrayList<>(strokes); // Return a copy for safety
    }

    /**
     * Thread-safe method to add a stroke
     */
    public synchronized void addStroke(StrokeModel stroke) {
        if (stroke == null) {
            throw new IllegalArgumentException("Stroke cannot be null");
        }
        strokes.add(stroke);
        undoStack.push(stroke);
        redoStack.clear(); // Clear redo stack when new stroke is added
    }

    /**
     * Undo the last stroke
     */
    public synchronized StrokeModel undo() {
        if (!undoStack.isEmpty()) {
            StrokeModel stroke = undoStack.pop();
            strokes.remove(stroke);
            redoStack.push(stroke);
            return stroke;
        }
        return null;
    }

    /**
     * Redo the last undone stroke
     */
    public synchronized StrokeModel redo() {
        if (!redoStack.isEmpty()) {
            StrokeModel stroke = redoStack.pop();
            strokes.add(stroke);
            undoStack.push(stroke);
            return stroke;
        }
        return null;
    }

    /**
     * Clear all strokes from the board
     */
    public synchronized void clear() {
        strokes.clear();
        undoStack.clear();
        redoStack.clear();
    }

    /**
     * Thread-safe method to get the number of strokes
     */
    public int getStrokeCount() {
        return strokes.size();
    }

    // Board settings getters and setters
    public int getWidth() {
        return width;
    }

    public void setWidth(int width) {
        if (width <= 0) {
            throw new IllegalArgumentException("Width must be greater than 0");
        }
        this.width = width;
    }

    public int getHeight() {
        return height;
    }

    public void setHeight(int height) {
        if (height <= 0) {
            throw new IllegalArgumentException("Height must be greater than 0");
        }
        this.height = height;
    }

    public String getBackgroundColor() {
        return backgroundColor;
    }

    public void setBackgroundColor(String backgroundColor) {
        if (backgroundColor == null || backgroundColor.trim().isEmpty()) {
            throw new IllegalArgumentException("Background color cannot be null or empty");
        }
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
        if (gridSize <= 0) {
            throw new IllegalArgumentException("Grid size must be greater than 0");
        }
        this.gridSize = gridSize;
    }

    public String getId() {
        return id;
    }

    @Override
    public String toString() {
        return "BoardModel{" +
                "id='" + id + '\'' +
                ", numberOfStrokes=" + strokes.size() +
                ", width=" + width +
                ", height=" + height +
                ", backgroundColor='" + backgroundColor + '\'' +
                ", showGrid=" + showGrid +
                ", gridSize=" + gridSize +
                '}';
    }
}