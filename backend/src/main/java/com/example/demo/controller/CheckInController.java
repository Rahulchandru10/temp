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
    private final BookingPassengerRepository bookingPassengerRepo;
    private final CheckInRepository checkInRepo;

    public CheckInController(
            BookingRepository bookingRepo,
            BoardingPassRepository boardingPassRepo,
            BookingPassengerRepository bookingPassengerRepo,
            CheckInRepository checkInRepo) {
        this.bookingRepo = bookingRepo;
        this.boardingPassRepo = boardingPassRepo;
        this.bookingPassengerRepo = bookingPassengerRepo;
        this.checkInRepo = checkInRepo;
    }

    @PostMapping("/{bookingId}")
    public java.util.List<BoardingPass> checkIn(@PathVariable Long bookingId) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        java.util.List<BoardingPass> passes = new java.util.ArrayList<>();

        // If it's a multi-passenger booking, check in everyone
        if (!booking.getPassengers().isEmpty()) {
            long currentCount = boardingPassRepo.countByBookingFlightId(booking.getFlight().getId());
            int nextSeat = (int) currentCount + 1;

            for (BookingPassenger bp : booking.getPassengers()) {
                if (!bp.isCheckedIn()) {
                    passes.add(createBoardingPass(booking, bp, String.valueOf(nextSeat++)));
                }
            }
        } else {
            // Fallback for single primary passenger
            Passenger p = booking.getPassenger();
            if (p != null && !boardingPassRepo.existsByBookingId(bookingId)) {
                long currentCount = boardingPassRepo.countByBookingFlightId(booking.getFlight().getId());
                passes.add(createBoardingPass(booking, null, String.valueOf(currentCount + 1)));
            }
        }
        return passes;
    }

    @PostMapping("/passenger/{passengerId}")
    public BoardingPass checkInPassenger(@PathVariable Long passengerId) {
        BookingPassenger bp = bookingPassengerRepo.findById(passengerId)
                .orElseThrow(() -> new RuntimeException("Passenger not found"));

        if (bp.isCheckedIn()) {
            throw new RuntimeException("Passenger already checked in");
        }

        long currentCount = boardingPassRepo.countByBookingFlightId(bp.getBooking().getFlight().getId());
        return createBoardingPass(bp.getBooking(), bp, String.valueOf(currentCount + 1));
    }

    private BoardingPass createBoardingPass(Booking booking, BookingPassenger bp, String seatNumber) {
        BoardingPass pass = new BoardingPass();
        pass.setBooking(booking);
        pass.setBookingPassenger(bp);
        pass.setSeatNumber(seatNumber);
        pass.setGate(booking.getFlight().getGate());
        pass.setBoardingTime(LocalDateTime.now().plusMinutes(30));
        pass.setStatus("ACTIVE");
        pass.setBoardingNumber("BP-" + java.util.UUID.randomUUID());

        if (bp != null) {
            bp.setCheckedIn(true);
            bp.setSeatNumber(pass.getSeatNumber());
            bookingPassengerRepo.save(bp);
        }

        BoardingPass savedPass = boardingPassRepo.save(pass);

        // Update CheckIn table
        CheckIn checkIn = new CheckIn();
        checkIn.setBooking(booking);
        checkIn.setSeatNumber(pass.getSeatNumber());
        checkIn.setCheckedIn(true);
        checkInRepo.save(checkIn);

        return savedPass;
    }
}
