package com.example.canvas.handler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import com.example.canvas.dto.request.ActionDTO;
import com.example.canvas.dto.response.PongDTO;
import com.example.canvas.dto.request.MessageType;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import javax.swing.*;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class DrawHandler extends TextWebSocketHandler {
    private final List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();
    private final List<ActionDTO> strokesHistory = new CopyOnWriteArrayList<>();
    private final Map<String, Long> userLastPing = new ConcurrentHashMap<>();

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
        userLastPing.put(session.getId(), System.currentTimeMillis());

        ActionDTO historyMessage = new ActionDTO();
        historyMessage.setType(MessageType.INIT);
        historyMessage.setData(strokesHistory);

        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(historyMessage)));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        JsonNode jsonNode = objectMapper.readTree(payload);
        String type = jsonNode.has("type") ? jsonNode.get("type").asText() : null;
        if ("PING".equals(type)) {
            long pingTimestamp = jsonNode.has("timestamp") ? jsonNode.get("timestamp").asLong() : System.currentTimeMillis();
            PongDTO pong = new PongDTO("PONG", pingTimestamp, session.getId());
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(pong)));
            return;
        }
        
        ActionDTO action = objectMapper.readValue(message.getPayload(), ActionDTO.class);

        switch (action.getType()) {
            case STROKE -> handleStroke(action, session);
            case CLEAR -> handleClear(session);
            case UNDO -> handleUndo(action.getData().toString(), session);
        }
    }

    private void handleStroke(ActionDTO action, WebSocketSession session) throws Exception {
        strokesHistory.add(action);
        broadcast(objectMapper.writeValueAsString(action), session);
    }

    private void handleClear(WebSocketSession session) throws Exception {
        strokesHistory.clear();

        ActionDTO message = new ActionDTO();
        message.setType(MessageType.CLEAR);

        broadcast(objectMapper.writeValueAsString(message), session);
    }

    private void handleUndo(String strokeId, WebSocketSession session) throws Exception {
        strokesHistory.removeIf(action -> {
            if (action.getType() == MessageType.STROKE && action.getData() instanceof Map) {
                Map<?, ?> dataMap = (Map<?, ?>) action.getData();
                return strokeId.equals(dataMap.get("id"));
            }
            return false;
        });

        ActionDTO message = new ActionDTO();
        message.setType(MessageType.UNDO);
        message.setData(strokeId);

        broadcast(objectMapper.writeValueAsString(message), session);
    }

    private void broadcast(String payload, WebSocketSession excludeSession) throws IOException {
        TextMessage textMessage = new TextMessage(payload);
        for (WebSocketSession s : sessions) {
            if (s.isOpen() && !s.getId().equals(excludeSession.getId())) {
                s.sendMessage(textMessage);
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session);
    }
}
