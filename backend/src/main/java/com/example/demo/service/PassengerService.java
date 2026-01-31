package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.demo.model.BoardingPass;
import com.example.demo.model.Passenger;
import com.example.demo.model.Booking;
import com.example.demo.repository.BoardingPassRepository;
import com.example.demo.repository.PassengerRepository;
import com.example.demo.repository.BookingRepository;
import com.example.demo.repository.CheckInRepository;
import com.example.demo.model.CheckIn;

@Service
public class PassengerService {

    private final PassengerRepository passengerRepo;
    private final BoardingPassRepository boardingRepo;
    private final BookingRepository bookingRepo;
    private final CheckInRepository checkInRepo;

    public PassengerService(
            PassengerRepository passengerRepo,
            BoardingPassRepository boardingRepo,
            BookingRepository bookingRepo,
            CheckInRepository checkInRepo) {
        this.passengerRepo = passengerRepo;
        this.boardingRepo = boardingRepo;
        this.bookingRepo = bookingRepo;
        this.checkInRepo = checkInRepo;
    }

    public Passenger getPassengerByUsername(String username) {
        return passengerRepo.findByUsername(username).orElse(null);
    }

    public java.util.List<BoardingPass> getBoardingPassByBookingId(Long bookingId) {
        return boardingRepo.findByBookingId(bookingId);
    }

    public Passenger addPassenger(Passenger passenger) {
        return passengerRepo.save(passenger);
    }

    public java.util.List<BoardingPass> checkIn(Long bookingId, String seatNumber) {

        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        java.util.List<BoardingPass> passes = new java.util.ArrayList<>();

        if (!booking.getPassengers().isEmpty()) {
            long currentCount = boardingRepo.countByBookingFlightId(booking.getFlight().getId());
            int nextSeat = (int) currentCount + 1;

            for (com.example.demo.model.BookingPassenger bp : booking.getPassengers()) {
                if (!bp.isCheckedIn()) {
                    bp.setCheckedIn(true);
                    bp.setSeatNumber(String.valueOf(nextSeat++));

                    BoardingPass pass = new BoardingPass();
                    pass.setBoardingNumber("BP-" + UUID.randomUUID());
                    pass.setBooking(booking);
                    pass.setBookingPassenger(bp);
                    pass.setSeatNumber(bp.getSeatNumber());
                    pass.setGate(booking.getFlight().getGate());
                    pass.setBoardingTime(LocalDateTime.now());
                    pass.setStatus("ACTIVE");
                    passes.add(boardingRepo.save(pass));

                    // Update CheckIn table
                    CheckIn checkIn = new CheckIn();
                    checkIn.setBooking(booking);
                    checkIn.setSeatNumber(bp.getSeatNumber());
                    checkIn.setCheckedIn(true);
                    checkInRepo.save(checkIn);
                }
            }
            bookingRepo.save(booking);
        } else {
            long currentCount = boardingRepo.countByBookingFlightId(booking.getFlight().getId());
            String autoSeat = String.valueOf(currentCount + 1);

            Passenger passenger = booking.getPassenger();
            passengerRepo.save(passenger);

            BoardingPass pass = new BoardingPass();
            pass.setBoardingNumber("BP-" + UUID.randomUUID());
            pass.setBooking(booking);
            pass.setSeatNumber(autoSeat);
            pass.setGate(booking.getFlight().getGate());
            pass.setBoardingTime(LocalDateTime.now());
            pass.setStatus("ACTIVE");
            passes.add(boardingRepo.save(pass));

            // Update CheckIn table
            CheckIn checkIn = new CheckIn();
            checkIn.setBooking(booking);
            checkIn.setSeatNumber(autoSeat);
            checkIn.setCheckedIn(true);
            checkInRepo.save(checkIn);

            bookingRepo.save(booking);
        }

        return passes;
    }
}
