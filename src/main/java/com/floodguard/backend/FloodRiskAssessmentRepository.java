
package com.floodguard.backend;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FloodRiskAssessmentRepository
        extends JpaRepository<FloodRiskAssessment, Long> {
}
