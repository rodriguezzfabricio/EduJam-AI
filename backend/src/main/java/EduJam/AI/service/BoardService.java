package EduJam.AI.service;

import EduJam.AI.model.Board;
import EduJam.AI.model.BoardModel;
import EduJam.AI.model.StrokeModel;
import EduJam.AI.dto.BoardDto;
import EduJam.AI.dto.StrokeDto;
import EduJam.AI.exception.BoardNotFoundException;
import EduJam.AI.exception.InvalidStrokeException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;
import java.util.Stack;
import java.util.stream.Collectors;

@Service
public class BoardService {
    // Store active boards in memory with thread-safe map
    private final Map<String, BoardModel> activeBoards = new ConcurrentHashMap<>();
    
    // Store strokes for each board
    private final Map<String, List<StrokeModel>> boardStrokes = new ConcurrentHashMap<>();
    
    // Store undo and redo stacks for each board
    private final Map<String, Stack<StrokeModel>> undoStacks = new ConcurrentHashMap<>();
    private final Map<String, Stack<StrokeModel>> redoStacks = new ConcurrentHashMap<>();
    
    /**
     * Creates a new board
     */
    public BoardModel createBoard() {
        BoardModel board = new BoardModel();
        activeBoards.put(board.getId(), board);
        return board;
    }
    
    /**
     * Get a board by ID
     */
    public BoardDto getBoardById(String boardId) {
        BoardModel boardModel = activeBoards.get(boardId);
        if (boardModel == null) {
            return null;
        }
        
        // Convert BoardModel to BoardDto
        BoardDto dto = new BoardDto();
        dto.setId(boardModel.getId());
        dto.setWidth(boardModel.getWidth());
        dto.setHeight(boardModel.getHeight());
        dto.setBackgroundColor(boardModel.getBackgroundColor());
        dto.setShowGrid(boardModel.isShowGrid());
        dto.setGridSize(boardModel.getGridSize());
        
        // Convert StrokeModels to StrokeDtos
        List<StrokeDto> strokeDtos = boardModel.getStrokes().stream()
                .map(this::convertToStrokeDto)
                .collect(Collectors.toList());
        dto.setStrokes(strokeDtos);
        
        return dto;
    }
    
    /**
     * Get all strokes for a board
     */
    public List<StrokeModel> getStrokesForBoard(String boardId) {
        return boardStrokes.getOrDefault(boardId, new ArrayList<>());
    }
    
    /**
     * Add a stroke to a board
     */
    public void addStroke(String boardId, StrokeDto strokeDto) {
        BoardModel board = activeBoards.get(boardId);
        if (board == null) {
            throw new IllegalArgumentException("Board not found: " + boardId);
        }
        
        StrokeModel strokeModel = convertToStrokeModel(strokeDto);
        strokeModel.setBoardId(boardId);
        board.addStroke(strokeModel);
    }
    
    /**
     * Undo the last stroke on a board
     */
    public boolean undoLastStroke(String boardId) {
        BoardModel board = activeBoards.get(boardId);
        if (board == null) {
            throw new IllegalArgumentException("Board not found: " + boardId);
        }
        
        return board.undo() != null;
    }
    
    /**
     * Redo the last undone stroke on a board
     */
    public StrokeDto redoLastStroke(String boardId) {
        BoardModel board = activeBoards.get(boardId);
        if (board == null) {
            throw new IllegalArgumentException("Board not found: " + boardId);
        }
        
        StrokeModel redoneStroke = board.redo();
        if (redoneStroke == null) {
            return null;
        }
        
        return convertToStrokeDto(redoneStroke);
    }
    
    /**
     * Clear a board
     */
    public void clearBoard(String boardId) {
        BoardModel board = activeBoards.get(boardId);
        if (board == null) {
            throw new IllegalArgumentException("Board not found: " + boardId);
        }
        
        board.clear();
    }
    
    /**
     * Update board settings
     */
    public void updateBoardSettings(String boardId, int width, int height, String backgroundColor, 
                                   boolean showGrid, int gridSize) {
        BoardModel board = activeBoards.get(boardId);
        if (board == null) {
            throw new IllegalArgumentException("Board not found: " + boardId);
        }
        
        board.setWidth(width);
        board.setHeight(height);
        board.setBackgroundColor(backgroundColor);
        board.setShowGrid(showGrid);
        board.setGridSize(gridSize);
    }

    /**
     * Get the stroke count for a board
     */
    public int getStrokeCount(String boardId) {
        BoardModel board = activeBoards.get(boardId);
        if (board == null) {
            throw new IllegalArgumentException("Board not found: " + boardId);
        }
        
        return board.getStrokeCount();
    }

    /**
     * Get board settings
     */
    public BoardModel getBoardSettings(String boardId) {
        return activeBoards.get(boardId);
    }

    /**
     * Removes a board from the in-memory store.
     */
    public void removeBoard(String boardId) {
        activeBoards.remove(boardId);
    }

    /**
     * Returns an immutable copy of all current boards (mainly for debugging)
     */
    public Map<String, BoardModel> getBoards() {
        return Map.copyOf(activeBoards);
    }
    
    // Helper method to convert StrokeModel to StrokeDto
    private StrokeDto convertToStrokeDto(StrokeModel model) {
        if (model == null) {
            return null;
        }
        
        StrokeDto dto = new StrokeDto();
        dto.setId(model.getId());
        dto.setBoardId(model.getBoardId());
        dto.setColor(model.getColor());
        dto.setWidth(model.getThickness());
        dto.setPoints(model.getPoints());
        dto.setTimestamp(model.getTimestamp());
        return dto;
    }
    
    // Helper method to convert StrokeDto to StrokeModel
    private StrokeModel convertToStrokeModel(StrokeDto dto) {
        if (dto == null) {
            return null;
        }
        
        StrokeModel model = new StrokeModel();
        if (dto.getId() != null) {
            model.setId(dto.getId());
        }
        model.setBoardId(dto.getBoardId());
        model.setColor(dto.getColor());
        model.setThickness(dto.getWidth());
        model.setPoints(dto.getPoints());
        model.setTimestamp(dto.getTimestamp());
        return model;
    }
}
