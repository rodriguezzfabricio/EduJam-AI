package EduJam.AI.service;

import EduJam.AI.model.ChatMessageModel;
import com.theokanning.openai.service.OpenAiService;
import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatMessage;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.time.Duration;

/**
 * Service that handles chat functionality and integration with OpenAI.
 */
@Service
public class ChatService {

    private final Map<String, List<ChatMessageModel>> chats = new ConcurrentHashMap<>();
    private final OpenAiService openAiService;

    public ChatService() {
        String apiKey = System.getenv("OPENAI_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            throw new IllegalStateException("OPENAI_API_KEY environment variable is not set");
        }
        this.openAiService = new OpenAiService(apiKey, Duration.ofSeconds(30));
    }

    public String getChatBotReply(String message) {
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

    /**
     * Saves a new message in the user chat history.
     */
    public void saveMessage(ChatMessageModel message) {
        chats.computeIfAbsent(message.getSessionId(), k -> new CopyOnWriteArrayList<>())
             .add(message);
    }

    /**
     * Returns the chat history for a given session. Returns an empty list if none.
     */
    public List<ChatMessageModel> getHistory(String sessionId) {
        return chats.getOrDefault(sessionId, List.of());
    }

    /**
     * Deletes the chat history for a session (e.g., on logout or timeout)
     */
    public void deleteHistory(String sessionId) {
        chats.remove(sessionId);
    }
} 