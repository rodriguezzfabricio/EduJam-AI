package EduJam.AI.controller;

import EduJam.AI.model.StrokeModel;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    @MessageMapping("/stroke")
    @SendTo("/topic/board")
    public StrokeModel handleStroke(StrokeModel stroke) {
        // For now, just broadcast the stroke to all connected clients
        // Later we can add validation, processing, or storage here
        return stroke;
    }
} 