package EduJam.AI.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for handling file uploads and storage.
 * This class provides methods for storing and retrieving files.
 */
@Service
public class FileStorageService {
    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);
    
    @Value("${app.file-storage.dir:./uploaded-files}")
    private String fileStorageDir;
    
    @Value("${app.file-storage.base-url:http://localhost:8080/api/files}")
    private String fileBaseUrl;
    
    private final ConcurrentHashMap<String, FileMetadata> activeUploads = new ConcurrentHashMap<>();
    
    /**
     * Initializes a file upload
     *
     * @param fileId the ID of the file
     * @param fileName the name of the file
     * @param mimeType the MIME type of the file
     * @throws IOException if an error occurs during initialization
     */
    public void initializeFile(String fileId, String fileName, String mimeType) throws IOException {
        log.info("Initializing file upload: {} ({}, {})", fileId, fileName, mimeType);
        
        // Create storage directory if it doesn't exist
        Path storagePath = Paths.get(fileStorageDir);
        if (!Files.exists(storagePath)) {
            Files.createDirectories(storagePath);
            log.info("Created file storage directory: {}", storagePath);
        }
        
        // Create temporary file
        Path filePath = storagePath.resolve(fileId);
        
        // Store metadata
        FileMetadata metadata = new FileMetadata(fileId, fileName, mimeType, filePath.toString());
        activeUploads.put(fileId, metadata);
    }
    
    /**
     * Appends data to a file
     *
     * @param fileId the ID of the file
     * @param data the data to append
     * @throws IOException if an error occurs during append
     */
    public void appendToFile(String fileId, byte[] data) throws IOException {
        FileMetadata metadata = activeUploads.get(fileId);
        
        if (metadata == null) {
            throw new IllegalArgumentException("No active upload found for file ID: " + fileId);
        }
        
        try (FileOutputStream fos = new FileOutputStream(metadata.getPath(), true)) {
            fos.write(data);
        }
    }
    
    /**
     * Finalizes a file upload
     *
     * @param fileId the ID of the file
     * @return the URL to access the file
     * @throws IOException if an error occurs during finalization
     */
    public String finalizeFile(String fileId) throws IOException {
        FileMetadata metadata = activeUploads.get(fileId);
        
        if (metadata == null) {
            throw new IllegalArgumentException("No active upload found for file ID: " + fileId);
        }
        
        // Generate a URL for the file
        String fileUrl = String.format("%s/%s", fileBaseUrl, fileId);
        
        log.info("Finalized file upload: {} -> {}", fileId, fileUrl);
        
        return fileUrl;
    }
    
    /**
     * Deletes a file
     *
     * @param fileId the ID of the file
     */
    public void deleteFile(String fileId) {
        FileMetadata metadata = activeUploads.remove(fileId);
        
        if (metadata == null) {
            log.warn("No active upload found for file ID: {}", fileId);
            return;
        }
        
        try {
            Files.deleteIfExists(Paths.get(metadata.getPath()));
            log.info("Deleted file: {}", metadata.getPath());
        } catch (IOException e) {
            log.error("Error deleting file: {}", metadata.getPath(), e);
        }
    }
    
    /**
     * Gets a file by ID
     *
     * @param fileId the ID of the file
     * @return the file, or null if not found
     */
    public File getFile(String fileId) {
        Path filePath = Paths.get(fileStorageDir, fileId);
        File file = filePath.toFile();
        
        if (!file.exists()) {
            log.warn("File not found: {}", filePath);
            return null;
        }
        
        return file;
    }
    
    /**
     * Extracts text from a file
     *
     * @param fileId the ID of the file
     * @param mimeType the MIME type of the file
     * @return the extracted text
     * @throws IOException if an error occurs during extraction
     */
    public String extractTextFromFile(String fileId, String mimeType) throws IOException {
        // For now, just read the file as text (would normally use libraries like Apache PDFBox or POI for real extraction)
        Path filePath = Paths.get(fileStorageDir, fileId);
        
        if (!Files.exists(filePath)) {
            throw new IOException("File not found: " + filePath);
        }
        
        // In a real implementation, we would use appropriate libraries based on mimeType
        // For PDF: Apache PDFBox
        // For DOCX: Apache POI
        // For this demo, we'll just read as text
        return Files.readString(filePath);
    }
    
    /**
     * Gets the MIME type of a file
     *
     * @param fileId the ID of the file
     * @return the MIME type, or null if not found
     */
    public String getMimeType(String fileId) {
        FileMetadata metadata = activeUploads.get(fileId);
        
        if (metadata == null) {
            log.warn("No metadata found for file ID: {}", fileId);
            return null;
        }
        
        return metadata.getMimeType();
    }
    
    /**
     * Gets the original file name
     *
     * @param fileId the ID of the file
     * @return the original file name, or null if not found
     */
    public String getFileName(String fileId) {
        FileMetadata metadata = activeUploads.get(fileId);
        
        if (metadata == null) {
            log.warn("No metadata found for file ID: {}", fileId);
            return null;
        }
        
        return metadata.getFileName();
    }
    
    /**
     * Class to store metadata about an active file upload
     */
    private static class FileMetadata {
        private final String fileId;
        private final String fileName;
        private final String mimeType;
        private final String path;
        
        public FileMetadata(String fileId, String fileName, String mimeType, String path) {
            this.fileId = fileId;
            this.fileName = fileName;
            this.mimeType = mimeType;
            this.path = path;
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
        
        public String getPath() {
            return path;
        }
    }
} 