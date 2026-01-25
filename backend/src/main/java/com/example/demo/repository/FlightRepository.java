package com.example.demo.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.Flight;

public interface FlightRepository extends JpaRepository<Flight, Long> {

    List<Flight> findBySourceIgnoreCaseAndDestinationIgnoreCaseAndDepartureTimeBetweenAndStatus(
            String source,
            String destination,
            LocalDateTime start,
            LocalDateTime end,
            String status
    );
}
