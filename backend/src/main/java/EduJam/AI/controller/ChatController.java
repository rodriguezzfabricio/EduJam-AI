package EduJam.AI.controller;

import EduJam.AI.dto.ChatBotDto;
import EduJam.AI.service.ChatService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private final ChatService chatService;
    public ChatController(ChatService chatService){
        this.chatService = chatService;
    }    

    @PostMapping("/send")
    public String chat(@RequestBody ChatBotDto chatBotDto){
        return chatService.getChatBotReply(chatBotDto.getMessage());
    }
}
