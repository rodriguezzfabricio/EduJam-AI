package EduJam.AI.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseConfig.class);

    @Bean
    public FirebaseApp firebaseApp() {
        if (FirebaseApp.getApps().isEmpty()) {
            try {
                // Load the service account key from resources
                InputStream serviceAccount = new ClassPathResource("firebase-service-account.json").getInputStream();

                // Initialize Firebase Admin SDK
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .setDatabaseUrl("https://mindsync-fa4ae.firebaseio.com")
                        .setStorageBucket("mindsync-fa4ae.firebasestorage.app")
                        .build();

                return FirebaseApp.initializeApp(options);
            } catch (IOException e) {
                logger.error("Error initializing Firebase: ", e);
                throw new RuntimeException("Firebase initialization failed", e);
            }
        } else {
            return FirebaseApp.getInstance();
        }
    }
} 