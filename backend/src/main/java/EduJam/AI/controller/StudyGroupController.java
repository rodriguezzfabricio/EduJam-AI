package EduJam.AI.controller;

import EduJam.AI.dto.StudyGroupDto;
import EduJam.AI.service.FirebaseAuthService;
import EduJam.AI.service.StudyGroupService;
import com.google.firebase.auth.FirebaseAuthException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/study-groups")
public class StudyGroupController {
    private static final Logger log = LoggerFactory.getLogger(StudyGroupController.class);
    
    private final StudyGroupService studyGroupService;
    private final FirebaseAuthService firebaseAuthService;
    
    public StudyGroupController(StudyGroupService studyGroupService, FirebaseAuthService firebaseAuthService) {
        this.studyGroupService = studyGroupService;
        this.firebaseAuthService = firebaseAuthService;
    }
    
    /**
     * Gets all available subjects
     *
     * @return the list of available subjects
     */
    @GetMapping("/subjects")
    public ResponseEntity<List<String>> getSubjects() {
        return ResponseEntity.ok(List.of("Math", "English", "Science", "Technology", "Social Studies"));
    }
    
    /**
     * Gets all active study groups for a subject
     *
     * @param subject the subject to filter by
     * @return the list of study groups
     */
    @GetMapping("/by-subject/{subject}")
    public ResponseEntity<List<StudyGroupDto>> getStudyGroupsBySubject(@PathVariable String subject) {
        log.info("Getting study groups for subject: {}", subject);
        List<StudyGroupDto> groups = studyGroupService.getStudyGroupsBySubject(subject);
        return ResponseEntity.ok(groups);
    }
    
    /**
     * Gets a specific study group by ID
     *
     * @param groupId the ID of the study group
     * @return the study group, or 404 if not found
     */
    @GetMapping("/{groupId}")
    public ResponseEntity<StudyGroupDto> getStudyGroup(@PathVariable String groupId) {
        log.info("Getting study group: {}", groupId);
        StudyGroupDto group = studyGroupService.getStudyGroup(groupId);
        
        if (group == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(group);
    }
    
    /**
     * Creates a new study group
     *
     * @param request the request containing name and subject
     * @param authorization the Firebase ID token in the Authorization header
     * @return the created study group
     */
    @PostMapping
    public ResponseEntity<?> createStudyGroup(@RequestBody Map<String, String> request,
                                           @RequestHeader("Authorization") String authorization) {
        String name = request.get("name");
        String subject = request.get("subject");
        
        if (name == null || subject == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name and subject are required"));
        }
        
        // Validate subject
        List<String> validSubjects = List.of("Math", "English", "Science", "Technology", "Social Studies");
        if (!validSubjects.contains(subject)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid subject"));
        }
        
        try {
            // Extract and verify Firebase token
            String token = firebaseAuthService.extractTokenFromHeader(authorization);
            String userId = firebaseAuthService.getUserIdFromToken(token);
            
            StudyGroupDto group = studyGroupService.createStudyGroup(name, subject, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(group);
        } catch (FirebaseAuthException e) {
            log.error("Authentication error", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication failed: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating study group", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error creating study group: " + e.getMessage()));
        }
    }
} 