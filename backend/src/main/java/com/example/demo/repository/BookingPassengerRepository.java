package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.model.BookingPassenger;

public interface BookingPassengerRepository extends JpaRepository<BookingPassenger, Long> {
}
