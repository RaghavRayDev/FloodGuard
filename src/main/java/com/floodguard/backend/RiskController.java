
package com.floodguard.backend;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
public class RiskController {

    @GetMapping("/api/risk/status")
    public String getStatus() {
        return "FloodGuard Backend is Running!";
    }
}
