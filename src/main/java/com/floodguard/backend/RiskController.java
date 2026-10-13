
package com.floodguard.backend;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
public class RiskController {

    private final FloodRiskAssessmentRepository repository;

    public RiskController(FloodRiskAssessmentRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/api/risk/status")
    public String getStatus() {
        return "FloodGuard Backend is Running!";
    }

    @PostMapping("/api/risk/assess")
    public Map<String, Object> assessRisk(
            @RequestBody Map<String, Object> request) {

        String location = String.valueOf(
                request.getOrDefault("location", "Unknown")
        );

        double rainfall = Double.parseDouble(
                String.valueOf(request.get("rainfall"))
        );

        double waterLevel = Double.parseDouble(
                String.valueOf(request.get("waterLevel"))
        );

        if (rainfall < 0 || rainfall > 300
                || waterLevel < 0 || waterLevel > 10) {
            throw new IllegalArgumentException(
                    "Rainfall must be 0-300 mm and water level 0-10 m"
            );
        }

        int score = (int) Math.round(
                (rainfall / 300.0) * 60
                + (waterLevel / 10.0) * 40
        );

        String level;

        if (score < 30) {
            level = "Low";
        } else if (score < 60) {
            level = "Moderate";
        } else if (score < 80) {
            level = "High";
        } else {
            level = "Severe";
        }

        String message =
                "Illustrative demo result, not an official flood warning";

        FloodRiskAssessment assessment = new FloodRiskAssessment();
        assessment.setLocation(location);
        assessment.setRainfall(rainfall);
        assessment.setWaterLevel(waterLevel);
        assessment.setScore(score);
        assessment.setLevel(level);
        assessment.setMessage(message);

        FloodRiskAssessment savedAssessment =
                repository.save(assessment);

        Map<String, Object> response = new HashMap<>();
        response.put("id", savedAssessment.getId());
        response.put("location", savedAssessment.getLocation());
        response.put("rainfall", savedAssessment.getRainfall());
        response.put("waterLevel", savedAssessment.getWaterLevel());
        response.put("score", savedAssessment.getScore());
        response.put("level", savedAssessment.getLevel());
        response.put("message", savedAssessment.getMessage());
        response.put("assessedAt", savedAssessment.getAssessedAt());

        return response;
    }
}
