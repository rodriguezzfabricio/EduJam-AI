package EduJam.AI.dto;

/**
 * Data Transfer Object for ChatBot, used to transport chatbot information
 * over WebSockets and REST endpoints.
 */
public class ChatBotDto {
    private String message;

    public ChatRequest(){}
    public ChatRequest(String message){
        this.message = message;
    }

    public String getMessage(){
        return message;
    }
    
    public void setMessage(String message){
        this.message = message;
    }    
}
