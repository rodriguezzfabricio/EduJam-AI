package EduJam.AI.handler;

import EduJam.AI.model.ChatMessageModel;
import EduJam.AI.model.UserSessionModel;
import EduJam.AI.service.ChatService;
import EduJam.AI.service.FileStorageService;
import EduJam.AI.service.UserSessionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ChatSocketHandler extends TextWebSocketHandler {
    private static final Logger logger = LoggerFactory.getLogger(ChatSocketHandler.class);
    
    private final ChatService chatService;
    private final UserSessionService sessionService;
    private final FileStorageService fileStorageService;
    private final ObjectMapper objectMapper;
    private final Map<String, FileUploadState> fileUploads = new ConcurrentHashMap<>();

    public ChatSocketHandler(ChatService chatService, UserSessionService sessionService, 
                             FileStorageService fileStorageService, ObjectMapper objectMapper) {
        this.chatService = chatService;
        this.sessionService = sessionService;
        this.fileStorageService = fileStorageService;
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String sessionId = session.getId();
        sessionService.touch(sessionId);
        logger.info("WebSocket connection established for session: {}", sessionId);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String sessionId = session.getId();
        sessionService.touch(sessionId);
        logger.info("Received message from session {}: {}", sessionId, message.getPayload());

        try {
            Map<String, Object> payload = objectMapper.readValue(message.getPayload(), Map.class);
            String type = (String) payload.get("type");
            logger.info("Message type: {}", type);

            switch (type) {
                case "register":
                    handleRegister(session, payload);
                    break;
                case "message":
                    handleMessage(session, payload);
                    break;
                case "getHistory":
                    handleGetHistory(session, payload);
                    break;
                case "initFileUpload":
                    handleInitFileUpload(session, payload);
                    break;
                case "fileUploadComplete":
                    handleFileUploadComplete(session, payload);
                    break;
                case "cancelFileUpload":
                    handleCancelFileUpload(session, payload);
                    break;
                default:
                    logger.warn("Unknown message type: {}", type);
                    session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                        "error", "Unknown message type: " + type
                    ))));
            }
        } catch (Exception e) {
            logger.error("Error processing message: ", e);
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                "error", "Error processing message: " + e.getMessage()
            ))));
        }
    }
    
    @Override
    protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) {
        String sessionId = session.getId();
        sessionService.touch(sessionId);
        
        // Check if there's an active file upload for this session
        FileUploadState uploadState = fileUploads.get(sessionId);
        if (uploadState == null) {
            logger.warn("Received binary message but no active file upload for session: {}", sessionId);
            try {
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                    "type", "error",
                    "message", "No active file upload"
                ))));
            } catch (IOException e) {
                logger.error("Error sending error message", e);
            }
            return;
        }
        
        // Process the binary chunk
        try {
            ByteBuffer buffer = message.getPayload();
            byte[] data = new byte[buffer.remaining()];
            buffer.get(data);
            
            // Append to file
            fileStorageService.appendToFile(uploadState.getFileId(), data);
            
            // Update upload state
            uploadState.setBytesUploaded(uploadState.getBytesUploaded() + data.length);
            
            // Send progress update
            int percentComplete = (int) ((double) uploadState.getBytesUploaded() / uploadState.getTotalSize() * 100);
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                "type", "fileUploadProgress",
                "fileId", uploadState.getFileId(),
                "bytesUploaded", uploadState.getBytesUploaded(),
                "totalSize", uploadState.getTotalSize(),
                "percentComplete", percentComplete
            ))));
            
            // Check if upload is complete
            if (uploadState.getBytesUploaded() >= uploadState.getTotalSize()) {
                try {
                    handleFileUploadComplete(session, Map.of(
                        "fileId", uploadState.getFileId(),
                        "fileName", uploadState.getFileName(),
                        "mimeType", uploadState.getMimeType()
                    ));
                } catch (Exception e) {
                    logger.error("Error handling file upload completion", e);
                    session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                        "type", "error",
                        "message", "Error processing completed file: " + e.getMessage()
                    ))));
                }
            }
        } catch (IOException e) {
            logger.error("Error processing binary message", e);
            try {
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                    "type", "error",
                    "message", "Error processing file upload: " + e.getMessage()
                ))));
            } catch (IOException ex) {
                logger.error("Error sending error message", ex);
            }
        }
    }

    private void handleRegister(WebSocketSession session, Map<String, Object> payload) throws Exception {
        String sessionId = (String) payload.get("sessionId");
        String username = (String) payload.get("username");
        logger.info("Handling register for session {} with username {}", sessionId, username);

        if (sessionId == null || username == null) {
            throw new IllegalArgumentException("Session ID and username are required");
        }

        UserSessionModel userSession = new UserSessionModel(username, session, null);
        sessionService.registerSession(userSession);

        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
            "type", "registered",
            "sessionId", sessionId,
            "username", username
        ))));
    }

    private void handleMessage(WebSocketSession session, Map<String, Object> payload) throws Exception {
        String sessionId = (String) payload.get("sessionId");
        String messageText = (String) payload.get("message");
        logger.info("Handling message for session {}: {}", sessionId, messageText);

        if (sessionId == null || messageText == null) {
            throw new IllegalArgumentException("Session ID and message are required");
        }

        // Create and save user message
        ChatMessageModel userMessage = new ChatMessageModel(sessionId, sessionId, messageText, true);
        chatService.saveMessage(userMessage);

        // Send user message back to client
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
            "type", "message",
            "message", Map.of(
                "content", messageText,
                "fromUser", true
            )
        ))));

        // Send typing indicator
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
            "type", "typing",
            "status", true
        ))));

        try {
            logger.info("Getting AI response for message: {}", messageText);
            // Get response from ChatGPT
            String aiReply = chatService.getChatBotReply(messageText);
            logger.info("Received AI response: {}", aiReply);

            // Create and save AI message
            ChatMessageModel aiMessage = new ChatMessageModel(sessionId, "AI", aiReply, false);
            chatService.saveMessage(aiMessage);

            // Remove typing indicator and send AI response
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                "type", "typing",
                "status", false
            ))));

            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                "type", "message",
                "message", Map.of(
                    "content", aiReply,
                    "fromUser", false
                )
            ))));
        } catch (Exception e) {
            logger.error("Error getting AI response: ", e);
            // Handle error gracefully
            ChatMessageModel errorMessage = new ChatMessageModel(
                sessionId,
                "AI",
                "Sorry, I encountered an error. Please try again.",
                false
            );
            chatService.saveMessage(errorMessage);
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                "type", "message",
                "message", Map.of(
                    "content", "Sorry, I encountered an error. Please try again.",
                    "fromUser", false
                )
            ))));
        }
    }

    private void handleGetHistory(WebSocketSession session, Map<String, Object> payload) throws Exception {
        String sessionId = (String) payload.get("sessionId");
        logger.info("Getting chat history for session: {}", sessionId);
        
        if (sessionId == null) {
            throw new IllegalArgumentException("Session ID is required");
        }

        var history = chatService.getHistory(sessionId);
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
            "type", "history",
            "messages", history
        ))));
    }
    
    private void handleInitFileUpload(WebSocketSession session, Map<String, Object> payload) throws Exception {
        String sessionId = session.getId();
        String fileName = (String) payload.get("fileName");
        String mimeType = (String) payload.get("mimeType");
        Long fileSize = ((Number) payload.get("fileSize")).longValue();
        
        logger.info("Initializing file upload for session {}: {} ({}, {} bytes)", 
                   sessionId, fileName, mimeType, fileSize);
        
        // Validate file type
        if (!isAllowedFileType(mimeType)) {
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                "type", "error",
                "message", "File type not allowed. Only PDF, DOCX, and images are supported."
            ))));
            return;
        }
        
        // Generate file ID
        String fileId = UUID.randomUUID().toString();
        
        // Initialize file in storage
        fileStorageService.initializeFile(fileId, fileName, mimeType);
        
        // Create upload state
        FileUploadState uploadState = new FileUploadState(fileId, fileName, mimeType, fileSize);
        fileUploads.put(sessionId, uploadState);
        
        // Send init confirmation
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
            "type", "fileUploadInitialized",
            "fileId", fileId,
            "fileName", fileName,
            "ready", true
        ))));
    }
    
    private void handleFileUploadComplete(WebSocketSession session, Map<String, Object> payload) throws Exception {
        String sessionId = session.getId();
        String fileId = (String) payload.get("fileId");
        
        logger.info("File upload complete for session {}, file ID: {}", sessionId, fileId);
        
        // Get upload state
        FileUploadState uploadState = fileUploads.get(sessionId);
        
        if (uploadState == null || !uploadState.getFileId().equals(fileId)) {
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                "type", "error",
                "message", "No matching file upload found"
            ))));
            return;
        }
        
        // Finalize file
        String fileUrl = fileStorageService.finalizeFile(fileId);
        
        // Create a message with the file
        String messageText = String.format("[File: %s](%s)", uploadState.getFileName(), fileUrl);
        
        // Create and save user message with file
        ChatMessageModel fileMessage = new ChatMessageModel(sessionId, sessionId, messageText, true);
        fileMessage.setFileUrl(fileUrl);
        fileMessage.setFileName(uploadState.getFileName());
        fileMessage.setMimeType(uploadState.getMimeType());
        chatService.saveMessage(fileMessage);
        
        // Send message to client
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
            "type", "message",
            "message", Map.of(
                "content", messageText,
                "fromUser", true,
                "fileUrl", fileUrl,
                "fileName", uploadState.getFileName(),
                "mimeType", uploadState.getMimeType()
            )
        ))));
        
        // Process the file with ChatGPT if it's a document
        if (isPdfOrDocx(uploadState.getMimeType())) {
            // Send typing indicator
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                "type", "typing",
                "status", true
            ))));
            
            try {
                // Process the document with ChatGPT
                String fileContent = fileStorageService.extractTextFromFile(fileId, uploadState.getMimeType());
                String prompt = "I've uploaded a document. Here's the content: \n\n" + fileContent + 
                                "\n\nPlease summarize this document and help me understand the key points.";
                
                // Get response from ChatGPT
                String aiReply = chatService.getChatBotReply(prompt);
                
                // Create and save AI message
                ChatMessageModel aiMessage = new ChatMessageModel(sessionId, "AI", aiReply, false);
                chatService.saveMessage(aiMessage);
                
                // Remove typing indicator and send AI response
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                    "type", "typing",
                    "status", false
                ))));
                
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                    "type", "message",
                    "message", Map.of(
                        "content", aiReply,
                        "fromUser", false
                    )
                ))));
            } catch (Exception e) {
                logger.error("Error processing file with ChatGPT", e);
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                    "type", "message",
                    "message", Map.of(
                        "content", "I couldn't process this file. Please try again or upload a different document.",
                        "fromUser", false
                    )
                ))));
            }
        }
        
        // Clean up
        fileUploads.remove(sessionId);
    }
    
    private void handleCancelFileUpload(WebSocketSession session, Map<String, Object> payload) throws Exception {
        String sessionId = session.getId();
        String fileId = (String) payload.get("fileId");
        
        logger.info("Cancelling file upload for session {}, file ID: {}", sessionId, fileId);
        
        // Get upload state
        FileUploadState uploadState = fileUploads.get(sessionId);
        
        if (uploadState == null || !uploadState.getFileId().equals(fileId)) {
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                "type", "error",
                "message", "No matching file upload found"
            ))));
            return;
        }
        
        // Delete the partial file
        fileStorageService.deleteFile(fileId);
        
        // Clean up
        fileUploads.remove(sessionId);
        
        // Send confirmation
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
            "type", "fileUploadCancelled",
            "fileId", fileId
        ))));
    }
    
    private boolean isAllowedFileType(String mimeType) {
        return mimeType != null && (
            mimeType.equals("application/pdf") ||
            mimeType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
            mimeType.startsWith("image/")
        );
    }
    
    private boolean isPdfOrDocx(String mimeType) {
        return mimeType != null && (
            mimeType.equals("application/pdf") ||
            mimeType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        );
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String sessionId = session.getId();
        logger.info("WebSocket connection closed for session: {} with status: {}", sessionId, status);
        
        // Clean up any active file uploads
        FileUploadState uploadState = fileUploads.remove(sessionId);
        if (uploadState != null) {
            fileStorageService.deleteFile(uploadState.getFileId());
            logger.info("Cleaned up incomplete file upload: {}", uploadState.getFileId());
        }
        
        sessionService.removeSession(sessionId);
    }
    
    /**
     * Class to track file upload state
     */
    private static class FileUploadState {
        private final String fileId;
        private final String fileName;
        private final String mimeType;
        private final long totalSize;
        private long bytesUploaded;
        
        public FileUploadState(String fileId, String fileName, String mimeType, long totalSize) {
            this.fileId = fileId;
            this.fileName = fileName;
            this.mimeType = mimeType;
            this.totalSize = totalSize;
            this.bytesUploaded = 0;
        }
        
        public String getFileId() {
            return fileId;
        }
        
        public String getFileName() {
            return fileName;
        }
        
        public String getMimeType() {
            return mimeType;
        }
        
        public long getTotalSize() {
            return totalSize;
        }
        
        public long getBytesUploaded() {
            return bytesUploaded;
        }
        
        public void setBytesUploaded(long bytesUploaded) {
            this.bytesUploaded = bytesUploaded;
        }
    }
} 