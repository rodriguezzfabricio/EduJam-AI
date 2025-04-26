package EduJam.AI.config;

import EduJam.AI.handler.BoardSocketHandler;
import EduJam.AI.handler.ChatSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.standard.TomcatRequestUpgradeStrategy;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final BoardSocketHandler boardSocketHandler;
    private final ChatSocketHandler chatSocketHandler;

    public WebSocketConfig(BoardSocketHandler boardSocketHandler, ChatSocketHandler chatSocketHandler) {
        this.boardSocketHandler = boardSocketHandler;
        this.chatSocketHandler = chatSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(boardSocketHandler, "/ws/board")
                .setHandshakeHandler(new DefaultHandshakeHandler(new TomcatRequestUpgradeStrategy()))
                .setAllowedOrigins("*");

        registry.addHandler(chatSocketHandler, "/ws/chat")
                .setHandshakeHandler(new DefaultHandshakeHandler(new TomcatRequestUpgradeStrategy()))
                .setAllowedOrigins("*");
    }
}
