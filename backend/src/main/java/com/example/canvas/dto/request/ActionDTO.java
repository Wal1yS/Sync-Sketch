package com.example.canvas.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActionDTO {
    // Type of message sent through WebSocket
    private MessageType type;
    // Payload of the message
    private Object data;
    // Name assigned to the user who sent this message
    private String myName; 
    // List of all connected users
    private List<String> users;

}