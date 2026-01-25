package com.example.demo.controller;

import java.time.LocalDateTime;

import org.springframework.web.bind.annotation.*;

import com.example.demo.model.*;
import com.example.demo.repository.*;

@RestController
@RequestMapping("/api/checkin")
@CrossOrigin
public class CheckInController {

    private final BookingRepository bookingRepo;
    private final BoardingPassRepository boardingPassRepo;

    public CheckInController(
            BookingRepository bookingRepo,
            BoardingPassRepository boardingPassRepo) {
        this.bookingRepo = bookingRepo;
        this.boardingPassRepo = boardingPassRepo;
    }

    @PostMapping("/{bookingId}")
    public BoardingPass checkIn(@PathVariable Long bookingId) {

        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Passenger passenger = booking.getPassenger();

        // Mark passenger as checked in
        passenger.setCheckedIn(true);

        // Create boarding pass
        BoardingPass bp = new BoardingPass();
        bp.setBooking(booking);
        bp.setSeatNumber("A" + (int) (Math.random() * 30));
        bp.setGate("G" + (int) (Math.random() * 10));
        bp.setBoardingTime(LocalDateTime.now().plusMinutes(30)); // 30 mins before now
        bp.setStatus("ACTIVE");
        bp.setBoardingNumber("BP-" + java.util.UUID.randomUUID());

        return boardingPassRepo.save(bp);
    }
}
