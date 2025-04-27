package EduJam.AI.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class FirebaseAuthService {
    private static final Logger logger = LoggerFactory.getLogger(FirebaseAuthService.class);

    /**
     * Verifies the given Firebase ID token and returns the decoded token
     * 
     * @param idToken the Firebase ID token to verify
     * @return the decoded token if valid
     * @throws FirebaseAuthException if the token is invalid
     */
    public FirebaseToken verifyToken(String idToken) throws FirebaseAuthException {
        if (idToken == null || idToken.isEmpty()) {
            logger.error("Firebase ID token is null or empty");
            throw new IllegalArgumentException("Firebase ID token must not be null or empty");
        }

        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            logger.info("Successfully verified token for user: {}", decodedToken.getUid());
            return decodedToken;
        } catch (FirebaseAuthException e) {
            logger.error("Failed to verify Firebase token", e);
            throw e;
        }
    }

    /**
     * Extracts the Firebase ID token from the Authorization header
     * 
     * @param authHeader the Authorization header value
     * @return the Firebase ID token
     */
    public String extractTokenFromHeader(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    /**
     * Gets user information from the Firebase ID token
     * 
     * @param idToken the Firebase ID token
     * @return the user uid if token is valid
     * @throws FirebaseAuthException if the token is invalid
     */
    public String getUserIdFromToken(String idToken) throws FirebaseAuthException {
        FirebaseToken decodedToken = verifyToken(idToken);
        return decodedToken.getUid();
    }
} 