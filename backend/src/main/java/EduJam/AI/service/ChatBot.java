package EduJam.AI.service;

import com.theokanning.openai.service.OpenAiService;
import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatMessage;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;

@Service
public class ChatBot {
    private final OpenAiService openAiService;

    public ChatBot() {
        String apiKey = System.getenv("OPENAI_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            throw new IllegalStateException("OPENAI_API_KEY environment variable is not set");
        }
        this.openAiService = new OpenAiService(apiKey, Duration.ofSeconds(30));
    }

    public String getResponse(String message) {
        ChatCompletionRequest completionRequest = ChatCompletionRequest.builder()
            .model("gpt-3.5-turbo")
            .messages(List.of(new ChatMessage("user", message)))
            .maxTokens(1000)
            .temperature(0.7)
            .build();

        return openAiService.createChatCompletion(completionRequest)
            .getChoices()
            .get(0)
            .getMessage()
            .getContent();
    }
}
