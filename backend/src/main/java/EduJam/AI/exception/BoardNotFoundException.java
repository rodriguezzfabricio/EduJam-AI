package EduJam.AI.exception;

public class BoardNotFoundException extends RuntimeException {
    public BoardNotFoundException(String boardId) {
        super("Board not found with ID: " + boardId);
    }
} 