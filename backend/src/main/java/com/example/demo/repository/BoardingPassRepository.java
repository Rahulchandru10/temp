package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.BoardingPass;
import java.util.Optional;
import java.util.List;

public interface BoardingPassRepository extends JpaRepository<BoardingPass, Long> {
    List<BoardingPass> findByBookingId(Long bookingId);

    Optional<BoardingPass> findByBookingPassengerId(Long passengerId);

    long countByBookingFlightId(Long flightId);

    boolean existsByBookingId(Long bookingId);
}
