package EduJam.AI.service;

import EduJam.AI.model.BoardModel;
import EduJam.AI.model.StrokeModel;
import EduJam.AI.exception.BoardNotFoundException;
import EduJam.AI.exception.InvalidStrokeException;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.util.UUID;

@Service
public class BoardService {
    // Store active boards in memory with thread-safe map
    private final Map<String, BoardModel> boards = new ConcurrentHashMap<>();

    /**
     * Create a new board with default settings
     */
    public BoardModel createBoard() {
        String boardId = UUID.randomUUID().toString();
        BoardModel board = new BoardModel();
        boards.put(boardId, board);
        return board;
    }

    /**
     * Get an existing board
     */
    public BoardModel getBoard(String boardId) {
        BoardModel board = boards.get(boardId);
        if (board == null) {
            throw new BoardNotFoundException(boardId);
        }
        return board;
    }

    /**
     * Add a stroke to a board with synchronization
     */
    public synchronized BoardModel addStroke(String boardId, StrokeModel stroke) {
        BoardModel board = getBoard(boardId);
        
        // Validate stroke
        if (stroke == null) {
            throw new InvalidStrokeException("Stroke cannot be null");
        }
        if (!boardId.equals(stroke.getBoardId())) {
            throw new InvalidStrokeException("Stroke board ID does not match");
        }
        
        board.addStroke(stroke);
        return board;
    }

    /**
     * Undo the last stroke on a board
     */
    public synchronized StrokeModel undoStroke(String boardId) {
        BoardModel board = getBoard(boardId);
        return board.undo();
    }

    /**
     * Redo the last undone stroke on a board
     */
    public synchronized StrokeModel redoStroke(String boardId) {
        BoardModel board = getBoard(boardId);
        return board.redo();
    }

    /**
     * Clear all strokes from a board
     */
    public synchronized void clearBoard(String boardId) {
        BoardModel board = getBoard(boardId);
        board.clear();
    }

    /**
     * Update board settings
     */
    public synchronized BoardModel updateBoardSettings(String boardId, int width, int height, 
                                                     String backgroundColor, boolean showGrid, int gridSize) {
        BoardModel board = getBoard(boardId);
        board.setWidth(width);
        board.setHeight(height);
        board.setBackgroundColor(backgroundColor);
        board.setShowGrid(showGrid);
        board.setGridSize(gridSize);
        return board;
    }

    /**
     * Get all strokes for a board
     */
    public List<StrokeModel> getStrokes(String boardId) {
        BoardModel board = getBoard(boardId);
        return board.getStrokes();
    }

    /**
     * Get the number of strokes on a board
     */
    public int getStrokeCount(String boardId) {
        BoardModel board = getBoard(boardId);
        return board.getStrokeCount();
    }

    /**
     * Get board settings
     */
    public BoardModel getBoardSettings(String boardId) {
        return getBoard(boardId);
    }
}
