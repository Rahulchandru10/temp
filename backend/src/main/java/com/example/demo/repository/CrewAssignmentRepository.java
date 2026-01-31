package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.CrewAssignment;

import java.util.Optional;

public interface CrewAssignmentRepository extends JpaRepository<CrewAssignment, Long> {
    Optional<CrewAssignment> findByCrewId(Long crewId);

    java.util.List<CrewAssignment> findByFlightId(Long flightId);
}
