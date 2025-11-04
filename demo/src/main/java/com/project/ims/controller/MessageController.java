package com.project.ims.controller;

import com.project.ims.dto.MessageRequest;
import com.project.ims.dto.MessageResponse;
import com.project.ims.security.UserDetailsImpl;
import com.project.ims.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MessageController {
    
	@Autowired
    private  MessageService messageService;
    
    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody MessageRequest request) {
        MessageResponse response = messageService.sendMessage(userDetails.getId(), request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/inbox")
    public ResponseEntity<List<MessageResponse>> getInbox(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<MessageResponse> messages = messageService.getInbox(userDetails.getId());
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/sent")
    public ResponseEntity<List<MessageResponse>> getSentMessages(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<MessageResponse> messages = messageService.getSentMessages(userDetails.getId());
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/folder/{folder}")
    public ResponseEntity<List<MessageResponse>> getMessagesByFolder(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String folder) {
        List<MessageResponse> messages = messageService.getMessagesByFolder(userDetails.getId(), folder);
        return ResponseEntity.ok(messages);
    }
    
    @PutMapping("/{id}/read")
    public ResponseEntity<MessageResponse> markAsRead(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        MessageResponse response = messageService.markAsRead(id, userDetails.getId());
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMessage(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        messageService.deleteMessage(id, userDetails.getId());
        return ResponseEntity.ok("Message deleted successfully");
    }
    
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long count = messageService.getUnreadCount(userDetails.getId());
        return ResponseEntity.ok(count);
    }
}
