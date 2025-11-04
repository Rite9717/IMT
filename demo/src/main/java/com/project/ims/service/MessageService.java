package com.project.ims.service;

import com.project.ims.dto.MessageRequest;
import com.project.ims.dto.MessageResponse;
import com.project.ims.model.Message;
import com.project.ims.model.User;
import com.project.ims.repository.MessageRepository;
import com.project.ims.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {
    
	@Autowired
    private MessageRepository messageRepository;
	@Autowired
    private UserRepository userRepository;
    
    @Transactional
    public MessageResponse sendMessage(Long senderId, MessageRequest request) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));
        
        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setSubject(request.getSubject());
        message.setBody(request.getBody());
        message.setFolder(request.getFolder());
        message.setSentAt(LocalDateTime.now());
        
        Message savedMessage = messageRepository.save(message);
        return convertToResponse(savedMessage);
    }
    
    public List<MessageResponse> getInbox(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return messageRepository.findByReceiverAndIsDeletedFalseOrderBySentAtDesc(user)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public List<MessageResponse> getSentMessages(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return messageRepository.findBySenderAndIsDeletedFalseOrderBySentAtDesc(user)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public List<MessageResponse> getMessagesByFolder(Long userId, String folder) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return messageRepository.findByReceiverAndFolderAndIsDeletedFalseOrderBySentAtDesc(user, folder)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public MessageResponse markAsRead(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        
        if (!message.getReceiver().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        message.setIsRead(true);
        message.setReadAt(LocalDateTime.now());
        Message updatedMessage = messageRepository.save(message);
        
        return convertToResponse(updatedMessage);
    }
    
    @Transactional
    public void deleteMessage(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        
        if (!message.getReceiver().getId().equals(userId) && !message.getSender().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        message.setIsDeleted(true);
        messageRepository.save(message);
    }
    
    public Long getUnreadCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return messageRepository.countByReceiverAndIsReadFalseAndIsDeletedFalse(user);
    }
    
    private MessageResponse convertToResponse(Message message) {
        MessageResponse response = new MessageResponse();
        response.setId(message.getId());
        response.setSenderId(message.getSender().getId());
        response.setSenderUsername(message.getSender().getUsername());
        response.setReceiverId(message.getReceiver().getId());
        response.setReceiverUsername(message.getReceiver().getUsername());
        response.setSubject(message.getSubject());
        response.setBody(message.getBody());
        response.setSentAt(message.getSentAt());
        response.setReadAt(message.getReadAt());
        response.setIsRead(message.getIsRead());
        response.setFolder(message.getFolder());
        return response;
    }
}
