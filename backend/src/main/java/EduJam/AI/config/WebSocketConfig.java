package EduJam.AI.config;

import EduJam.AI.handler.BoardSocketHandler;
import EduJam.AI.handler.ChatSocketHandler;
import EduJam.AI.handler.StudyGroupSocketHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.standard.TomcatRequestUpgradeStrategy;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    private static final Logger log = LoggerFactory.getLogger(WebSocketConfig.class);
    
    private final BoardSocketHandler boardSocketHandler;
    private final ChatSocketHandler chatSocketHandler;
    private final StudyGroupSocketHandler studyGroupSocketHandler;
    private final WebSocketAuthenticationInterceptor authInterceptor;

    public WebSocketConfig(BoardSocketHandler boardSocketHandler, 
                           ChatSocketHandler chatSocketHandler,
                           StudyGroupSocketHandler studyGroupSocketHandler,
                           WebSocketAuthenticationInterceptor authInterceptor) {
        this.boardSocketHandler = boardSocketHandler;
        this.chatSocketHandler = chatSocketHandler;
        this.studyGroupSocketHandler = studyGroupSocketHandler;
        this.authInterceptor = authInterceptor;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        log.info("Registering WebSocket handlers");
        
        // Create a default handshake handler
        DefaultHandshakeHandler handshakeHandler = new DefaultHandshakeHandler(new TomcatRequestUpgradeStrategy());
        
        // Register board handler with appropriate CORS settings
        registry.addHandler(boardSocketHandler, "/ws/board")
                .setHandshakeHandler(handshakeHandler)
                .addInterceptors(authInterceptor)
                .setAllowedOrigins("*");
        log.info("Registered board WebSocket handler at /ws/board");
        
        // Register chat handler with appropriate CORS settings
        registry.addHandler(chatSocketHandler, "/ws/chat")
                .setHandshakeHandler(handshakeHandler)
                .addInterceptors(authInterceptor)
                .setAllowedOrigins("*");
        log.info("Registered chat WebSocket handler at /ws/chat");
        
        // Register study group handler with appropriate CORS settings
        registry.addHandler(studyGroupSocketHandler, "/ws/study-group")
                .setHandshakeHandler(handshakeHandler)
                .addInterceptors(authInterceptor)
                .setAllowedOrigins("*");
        log.info("Registered study group WebSocket handler at /ws/study-group");
    }
}
