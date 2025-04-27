package EduJam.AI.controller;

import EduJam.AI.service.FileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Controller for managing file uploads and downloads.
 */
@RestController
@RequestMapping("/api/files")
public class FileController {
    private static final Logger log = LoggerFactory.getLogger(FileController.class);
    
    private final FileStorageService fileStorageService;
    
    public FileController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }
    
    /**
     * Gets a file by ID
     *
     * @param fileId the ID of the file
     * @return the file as a downloadable resource
     */
    @GetMapping("/{fileId}")
    public ResponseEntity<Resource> getFile(@PathVariable String fileId) {
        log.info("File download request for ID: {}", fileId);
        
        File file = fileStorageService.getFile(fileId);
        
        if (file == null) {
            log.warn("File not found: {}", fileId);
            return ResponseEntity.notFound().build();
        }
        
        // Get file metadata
        String fileName = fileStorageService.getFileName(fileId);
        String mimeType = fileStorageService.getMimeType(fileId);
        
        // If metadata is not available, use defaults
        if (fileName == null) {
            fileName = "download";
        }
        
        if (mimeType == null) {
            mimeType = "application/octet-stream";
        }
        
        // Encode the filename for Content-Disposition header
        String encodedFilename = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replaceAll("\\+", "%20");
        
        // Create headers
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedFilename);
        
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType(mimeType))
                .body(new FileSystemResource(file));
    }
    
    /**
     * Gets file metadata
     *
     * @param fileId the ID of the file
     * @return the file metadata
     */
    @GetMapping("/{fileId}/metadata")
    public ResponseEntity<?> getFileMetadata(@PathVariable String fileId) {
        log.info("File metadata request for ID: {}", fileId);
        
        String fileName = fileStorageService.getFileName(fileId);
        String mimeType = fileStorageService.getMimeType(fileId);
        
        if (fileName == null || mimeType == null) {
            log.warn("File metadata not found: {}", fileId);
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(new FileMetadataDto(fileId, fileName, mimeType));
    }
    
    /**
     * DTO for file metadata
     */
    private static class FileMetadataDto {
        private final String fileId;
        private final String fileName;
        private final String mimeType;
        
        public FileMetadataDto(String fileId, String fileName, String mimeType) {
            this.fileId = fileId;
            this.fileName = fileName;
            this.mimeType = mimeType;
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
    }
} 