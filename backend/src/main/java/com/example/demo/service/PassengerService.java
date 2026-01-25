package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.demo.model.BoardingPass;
import com.example.demo.model.Passenger;
import com.example.demo.model.CheckIn;
import com.example.demo.model.Booking;
import com.example.demo.repository.BoardingPassRepository;
import com.example.demo.repository.PassengerRepository;
import com.example.demo.repository.CheckInRepository;
import com.example.demo.repository.BookingRepository;

@Service
public class PassengerService {

    private final PassengerRepository passengerRepo;
    private final BoardingPassRepository boardingRepo;
    private final CheckInRepository checkInRepo;
    private final BookingRepository bookingRepo;

    public PassengerService(
            PassengerRepository passengerRepo,
            BoardingPassRepository boardingRepo,
            CheckInRepository checkInRepo,
            BookingRepository bookingRepo) {
        this.passengerRepo = passengerRepo;
        this.boardingRepo = boardingRepo;
        this.checkInRepo = checkInRepo;
        this.bookingRepo = bookingRepo;
    }

    public Passenger getPassengerByUsername(String username) {
        return passengerRepo.findByUsername(username).orElse(null);
    }

    public BoardingPass getBoardingPassByBookingId(Long bookingId) {
        return boardingRepo.findAll().stream()
                .filter(bp -> bp.getBooking().getId().equals(bookingId))
                .findFirst()
                .orElse(null);
    }

    public Passenger addPassenger(Passenger passenger) {
        passenger.setCheckedIn(false);
        return passengerRepo.save(passenger);
    }

    public BoardingPass checkIn(Long bookingId, String seatNumber) {

        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Passenger passenger = booking.getPassenger();

        passenger.setCheckedIn(true);
        passenger.setSeatNumber(seatNumber);

        // Record in CheckIn table
        CheckIn ci = new CheckIn();
        ci.setBooking(booking);
        ci.setSeatNumber(seatNumber);
        ci.setCheckedIn(true);
        checkInRepo.save(ci);

        // Generate Boarding Pass
        BoardingPass pass = new BoardingPass();
        pass.setBoardingNumber("BP-" + UUID.randomUUID());
        pass.setBooking(booking);
        pass.setSeatNumber(seatNumber);
        pass.setGate("G" + (int) (Math.random() * 10));
        pass.setBoardingTime(LocalDateTime.now());
        pass.setStatus("ACTIVE");

        passengerRepo.save(passenger);
        return boardingRepo.save(pass);
    }
}
