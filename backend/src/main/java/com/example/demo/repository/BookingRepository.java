package com.example.demo.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.model.Booking;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    @Query("SELECT b FROM Booking b WHERE b.passenger.id = :passengerId")
    List<Booking> findByPassengerId(@Param("passengerId") Long passengerId);

    List<Booking> findByFlightId(Long flightId);
}
