package EduJam.AI;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EduJamAiApplication {
    public static void main(String[] args) {
        SpringApplication.run(EduJamAiApplication.class, args);
    }
}
