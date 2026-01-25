package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.Booking;
import com.example.demo.model.Passenger;

public interface PassengerRepository extends JpaRepository<Passenger, Long> {
    java.util.Optional<Passenger> findByEmail(String email);

    java.util.Optional<Passenger> findByUsername(String username);
}
