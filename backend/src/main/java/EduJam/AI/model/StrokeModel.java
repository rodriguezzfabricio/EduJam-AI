package EduJam.AI.model;

/**
 * Represents a stroke drawn on a canvas with start and end coordinates,
 * color, and brush size information. This model is used to track drawing
 * operations in the application.
 */
public class StrokeModel {
    private double startX;
    private double startY;
    private double endX;
    private double endY;
    private String color;
    private int size;

    /**
     * Default constructor. Creates an empty stroke model.
     */
    public StrokeModel() {}

    /**
     * Creates a new stroke model with the specified parameters.
     *
     * @param startX The x-coordinate of the starting point
     * @param startY The y-coordinate of the starting point
     * @param endX The x-coordinate of the ending point
     * @param endY The y-coordinate of the ending point
     * @param color The color of the stroke in hex format (e.g., "#FF0000")
     * @param size The brush size in pixels
     * @throws IllegalArgumentException if size is less than or equal to 0
     */
    public StrokeModel(double startX, double startY, double endX, double endY, String color, int size) {
        setStartX(startX);
        setStartY(startY);
        setEndX(endX);
        setEndY(endY);
        setColor(color);
        setSize(size);
    }

    // Getters and Setters
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
                "startX=" + startX +
                ", startY=" + startY +
                ", endX=" + endX +
                ", endY=" + endY +
                ", color='" + color + '\'' +
                ", size=" + size +
                '}';
    }
}
