package EduJam.AI.model;

import java.util.ArrayList;
import java.util.List;

/**
 * It holds a collection of all the strokes drawn on the board.
 */
public class BoardModel {

    /**
     * A list containing all the StrokeModel objects drawn on this board,
     * maintained in the order they were created.
     */
    private List<StrokeModel> strokes;

    public BoardModel() {
        // Initialize with an empty ArrayList to avoid NullPointerExceptions
        this.strokes = new ArrayList<>();
    }

    public List<StrokeModel> getStrokes() {
        return strokes;
    }

    public void setStrokes(List<StrokeModel> strokes) {
        if (strokes == null) {
            throw new IllegalArgumentException("Strokes list cannot be null. Use an empty list instead.");
        }
        this.strokes = strokes;
    }

    @Override
    public String toString() {
        return "BoardModel{" +
                "numberOfStrokes=" + (strokes != null ? strokes.size() : 0) +
                '}';
    }
}