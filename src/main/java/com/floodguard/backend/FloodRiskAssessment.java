
package com.floodguard.backend;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "flood_risk_assessments")
public class FloodRiskAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String location;

    private double rainfall;

    private double waterLevel;

    private int score;

    private String level;

    @Column(length = 200)
    private String message;

    private LocalDateTime assessedAt;

    public FloodRiskAssessment() {
    }

    @PrePersist
    public void setAssessmentTime() {
        if (assessedAt == null) {
            assessedAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public double getRainfall() {
        return rainfall;
    }

    public void setRainfall(double rainfall) {
        this.rainfall = rainfall;
    }

    public double getWaterLevel() {
        return waterLevel;
    }

    public void setWaterLevel(double waterLevel) {
        this.waterLevel = waterLevel;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getAssessedAt() {
        return assessedAt;
    }
}
