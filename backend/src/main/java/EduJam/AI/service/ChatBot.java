
@Service
public class ChatBot {
   private final OpenAiService openAiService; 
   public ChatService(){
        this.openAiService = new OpenAiService(System.getenv("OPENAI_API_KEY"));
   } 

   public String getChatBotReply(){
        ChatCompletion completion = chatCompletion.builder()
        .model("gpt-3.5-turbo")
        .messages(List.of(new ChatMessage("user", message)))
        .build();

        ChatCompletionResult result = openAiService.createChatCompletion(completion);
        return result.getChoices().get(0).getMessage().getContent();
   }

   
}
