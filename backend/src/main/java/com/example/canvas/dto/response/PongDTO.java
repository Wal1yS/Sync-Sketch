package com.example.canvas.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PongDTO {
    private String type;
    private long timestamp;
    private String userId;
}