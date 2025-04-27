package EduJam.AI.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hi")
public class HiController {
    
    @GetMapping
    public String sayHi() {
        return "Hello from MindSync!";
    }
} 