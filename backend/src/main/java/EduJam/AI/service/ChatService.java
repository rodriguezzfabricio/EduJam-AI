package EduJam.AI.service;

import EduJam.AI.model.ChatMessageModel;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Placeholder service that stores chat messages in memory, keyed by sessionId.
 * It is designed so the storage layer can easily be swapped out (e.g., Redis) later.
 */
@Service
public class ChatService {

    private final Map<String, List<ChatMessageModel>> chats = new ConcurrentHashMap<>();

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