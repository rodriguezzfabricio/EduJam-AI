package EduJam.AI.controller;

import EduJam.AI.model.BoardModel;
import EduJam.AI.dto.BoardDto;
import EduJam.AI.service.BoardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for handling board creation and retrieval.
 * This controller provides endpoints for testing the drawing functionality.
 */
@RestController
@RequestMapping("/api")
public class UserController {

    private final BoardService boardService;

    @Autowired
    public UserController(BoardService boardService) {
        this.boardService = boardService;
    }

    /**
     * Home endpoint to verify the backend is running.
     */
    @GetMapping("/")
    public String home() {
        return "EduJam-AI backend is running!";
    }

    /**
     * Creates a new drawing board.
     * @return The created board model
     */
    @PostMapping("/boards")
    public ResponseEntity<BoardModel> createBoard() {
        BoardModel board = boardService.createBoard();
        return ResponseEntity.ok(board);
    }

    /**
     * Retrieves a board by ID.
     * @param boardId The ID of the board to retrieve
     * @return The board if found
     */
    @GetMapping("/boards/{boardId}")
    public ResponseEntity<BoardDto> getBoard(@PathVariable String boardId) {
        BoardDto board = boardService.getBoardById(boardId);
        if (board == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(board);
    }

    /**
     * Returns information about the application endpoints.
     * @return A map of available endpoints and their descriptions
     */
    @GetMapping("/info")
    public ResponseEntity<Map<String, String>> getInfo() {
        Map<String, String> info = Map.of(
            "createBoard", "POST /api/boards",
            "getBoard", "GET /api/boards/{boardId}",
            "webSocketBoard", "WebSocket /ws/board",
            "webSocketChat", "WebSocket /ws/chat"
        );
        return ResponseEntity.ok(info);
    }
}
