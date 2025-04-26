package EduJam.AI.service;

import EduJam.AI.model.UserSessionModel;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Manages user sessions for both board and chat sockets. In-memory for now.
 */
@Service
public class UserSessionService {

    private final Map<String, UserSessionModel> sessions = new ConcurrentHashMap<>();

    /**
     * Registers or updates a session.
     */
    public UserSessionModel registerSession(UserSessionModel session) {
        sessions.put(session.getSessionId(), session);
        return session;
    }

    public UserSessionModel getSession(String sessionId) {
        return sessions.get(sessionId);
    }

    public void removeSession(String sessionId) {
        UserSessionModel removed = sessions.remove(sessionId);
        if (removed != null) removed.closeSessions();
    }

    /**
     * Update activity timestamp for given session.
     */
    public void touch(String sessionId) {
        UserSessionModel s = sessions.get(sessionId);
        if (s != null) s.updateActivity();
    }

    /**
     * Periodic cleanup of expired sessions.
     * Runs every 5 minutes.
     */
    @Scheduled(fixedRate = 5 * 60 * 1000)
    public void cleanup() {
        sessions.values().removeIf(s -> {
            boolean expired = s.isExpired(UserSessionModel.DEFAULT_TIMEOUT);
            if (expired) s.closeSessions();
            return expired;
        });
    }

    public Map<String, UserSessionModel> getAllSessions() {
        return Map.copyOf(sessions);
    }
} 