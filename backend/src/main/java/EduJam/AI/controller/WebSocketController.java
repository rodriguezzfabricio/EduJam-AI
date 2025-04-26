package EduJam.AI.controller;

import EduJam.AI.model.StrokeModel;
import EduJam.AI.model.BoardModel;
import EduJam.AI.service.BoardService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;

@Controller
public class WebSocketController {
    
    private final BoardService boardService;
    private final SimpMessagingTemplate messagingTemplate;
    
    public WebSocketController(BoardService boardService, SimpMessagingTemplate messagingTemplate) {
        this.boardService = boardService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/stroke")
    @SendTo("/topic/board/{boardId}")
    public StrokeModel handleStroke(StrokeModel stroke) {
        String boardId = stroke.getBoardId();
        boardService.addStroke(boardId, stroke);
        return stroke;
    }

    @MessageMapping("/board/create")
    @SendTo("/topic/board/created")
    public BoardModel createBoard() {
        return boardService.createBoard();
    }

    @MessageMapping("/board/join")
    @SendTo("/topic/board/{boardId}/joined")
    public BoardModel joinBoard(String boardId) {
        BoardModel board = boardService.getBoard(boardId);
        // Send current board state to the joining user
        messagingTemplate.convertAndSendToUser(
            boardId, 
            "/queue/board/state", 
            Map.of(
                "strokes", board.getStrokes(),
                "settings", Map.of(
                    "width", board.getWidth(),
                    "height", board.getHeight(),
                    "backgroundColor", board.getBackgroundColor(),
                    "showGrid", board.isShowGrid(),
                    "gridSize", board.getGridSize()
                )
            )
        );
        return board;
    }

    @MessageMapping("/board/undo")
    @SendTo("/topic/board/{boardId}/undo")
    public StrokeModel undoStroke(String boardId) {
        return boardService.undoStroke(boardId);
    }

    @MessageMapping("/board/redo")
    @SendTo("/topic/board/{boardId}/redo")
    public StrokeModel redoStroke(String boardId) {
        return boardService.redoStroke(boardId);
    }

    @MessageMapping("/board/clear")
    @SendTo("/topic/board/{boardId}/cleared")
    public void clearBoard(String boardId) {
        boardService.clearBoard(boardId);
    }

    @MessageMapping("/board/settings")
    @SendTo("/topic/board/{boardId}/settings")
    public BoardModel updateBoardSettings(Map<String, Object> settings) {
        String boardId = (String) settings.get("boardId");
        int width = (int) settings.get("width");
        int height = (int) settings.get("height");
        String backgroundColor = (String) settings.get("backgroundColor");
        boolean showGrid = (boolean) settings.get("showGrid");
        int gridSize = (int) settings.get("gridSize");

        return boardService.updateBoardSettings(
            boardId, width, height, backgroundColor, showGrid, gridSize
        );
    }
} 