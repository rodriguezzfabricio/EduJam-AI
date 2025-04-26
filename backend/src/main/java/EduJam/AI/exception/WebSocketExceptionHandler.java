package EduJam.AI.exception;

import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.web.bind.annotation.ControllerAdvice;

@ControllerAdvice
public class WebSocketExceptionHandler {

    @MessageExceptionHandler
    @SendToUser("/queue/errors")
    public String handleException(Exception exception) {
        return "Error: " + exception.getMessage();
    }

    @MessageExceptionHandler(BoardNotFoundException.class)
    @SendToUser("/queue/errors")
    public String handleBoardNotFoundException(BoardNotFoundException exception) {
        return "Board Error: " + exception.getMessage();
    }

    @MessageExceptionHandler(InvalidStrokeException.class)
    @SendToUser("/queue/errors")
    public String handleInvalidStrokeException(InvalidStrokeException exception) {
        return "Stroke Error: " + exception.getMessage();
    }
} 