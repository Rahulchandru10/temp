package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.FlightCrew;

public interface FlightCrewRepository extends JpaRepository<FlightCrew, Long> {
}
