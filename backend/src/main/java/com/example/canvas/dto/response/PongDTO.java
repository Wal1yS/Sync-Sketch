package com.example.canvas.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Response sent by the server as a PONG message to report latency info
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PongDTO {
    private String type;
    private long timestamp;
    private String userId;
}