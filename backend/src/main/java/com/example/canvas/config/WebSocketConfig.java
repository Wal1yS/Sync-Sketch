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

    public WebSocketConfig(DrawHandler drawHandler) {
        this.drawHandler = drawHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(drawHandler, "/draw").setAllowedOrigins("*");
    }
}
