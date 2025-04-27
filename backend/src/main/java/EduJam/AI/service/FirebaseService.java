package EduJam.AI.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.UserRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class FirebaseService {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseService.class);
    
    /**
     * Verifies the provided Firebase ID token and returns the decoded token
     *
     * @param idToken the ID token to verify
     * @return the decoded FirebaseToken if valid
     * @throws FirebaseAuthException if the token is invalid
     */
    public FirebaseToken verifyIdToken(String idToken) throws FirebaseAuthException {
        try {
            return FirebaseAuth.getInstance().verifyIdToken(idToken);
        } catch (FirebaseAuthException e) {
            logger.error("Error verifying Firebase ID token: {}", e.getMessage());
            throw e;
        }
    }
    
    /**
     * Gets a user by their UID
     *
     * @param uid the user's UID
     * @return the UserRecord for the user
     * @throws FirebaseAuthException if the user cannot be found
     */
    public UserRecord getUserByUid(String uid) throws FirebaseAuthException {
        try {
            return FirebaseAuth.getInstance().getUser(uid);
        } catch (FirebaseAuthException e) {
            logger.error("Error getting user by UID {}: {}", uid, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Gets a user by their email
     *
     * @param email the user's email
     * @return the UserRecord for the user
     * @throws FirebaseAuthException if the user cannot be found
     */
    public UserRecord getUserByEmail(String email) throws FirebaseAuthException {
        try {
            return FirebaseAuth.getInstance().getUserByEmail(email);
        } catch (FirebaseAuthException e) {
            logger.error("Error getting user by email {}: {}", email, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Creates a custom token for a user
     *
     * @param uid the user's UID
     * @return a custom authentication token
     * @throws FirebaseAuthException if the token cannot be created
     */
    public String createCustomToken(String uid) throws FirebaseAuthException {
        try {
            return FirebaseAuth.getInstance().createCustomToken(uid);
        } catch (FirebaseAuthException e) {
            logger.error("Error creating custom token for user {}: {}", uid, e.getMessage());
            throw e;
        }
    }
} 