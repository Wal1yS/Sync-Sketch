package com.example.canvas.config;

import com.example.canvas.handler.DrawHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final DrawHandler drawHandler;

    // Inject the WebSocket handler that will process all drawing messages
    public WebSocketConfig(DrawHandler drawHandler) {
        this.drawHandler = drawHandler;
    }

    // Register WebSocket handler for drawing events
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(drawHandler, "/draw").setAllowedOrigins("*");
    }
}
