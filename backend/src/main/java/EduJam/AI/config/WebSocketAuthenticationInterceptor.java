package EduJam.AI.config;

import EduJam.AI.service.FirebaseAuthService;
import com.google.firebase.auth.FirebaseAuthException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.List;
import java.util.Map;

@Component
public class WebSocketAuthenticationInterceptor implements HandshakeInterceptor {
    private static final Logger log = LoggerFactory.getLogger(WebSocketAuthenticationInterceptor.class);
    private final FirebaseAuthService firebaseAuthService;

    public WebSocketAuthenticationInterceptor(FirebaseAuthService firebaseAuthService) {
        this.firebaseAuthService = firebaseAuthService;
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                  WebSocketHandler wsHandler, Map<String, Object> attributes) {
        log.info("Processing WebSocket connection request");
        
        // Extract token from the Authorization header or query parameter
        String token = extractToken(request);
        
        if (!StringUtils.hasText(token)) {
            log.warn("No authentication token provided for WebSocket connection");
            return true; // Allow connection without authentication for now, we'll validate on message receipt
        }
        
        try {
            // Verify the token
            var decodedToken = firebaseAuthService.verifyToken(token);
            String userId = decodedToken.getUid();
            
            // Store user ID in the WebSocket session attributes for later use
            attributes.put("userId", userId);
            attributes.put("email", decodedToken.getEmail());
            attributes.put("authenticated", true);
            
            log.info("Authenticated WebSocket connection for user: {}", userId);
            return true;
        } catch (FirebaseAuthException e) {
            log.error("Authentication failed for WebSocket connection", e);
            return false; // Reject the connection
        }
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                              WebSocketHandler wsHandler, Exception exception) {
        // Nothing to do after handshake
    }
    
    private String extractToken(ServerHttpRequest request) {
        // Try to get token from Authorization header first
        List<String> authorization = request.getHeaders().get("Authorization");
        if (authorization != null && !authorization.isEmpty()) {
            String authHeader = authorization.get(0);
            if (authHeader.startsWith("Bearer ")) {
                return authHeader.substring(7);
            }
        }
        
        // Try to get token from query parameter
        String query = request.getURI().getQuery();
        if (query != null) {
            String[] pairs = query.split("&");
            for (String pair : pairs) {
                String[] keyValue = pair.split("=");
                if (keyValue.length == 2 && "token".equals(keyValue[0])) {
                    return keyValue[1];
                }
            }
        }
        
        return null;
    }
} 