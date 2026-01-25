package com.example.demo.service;

import org.springframework.stereotype.Service;

import com.example.demo.model.Booking;
import com.example.demo.model.Flight;
import com.example.demo.model.Passenger;
import com.example.demo.model.Payment;
import com.example.demo.repository.BookingRepository;
import com.example.demo.repository.FlightRepository;
import com.example.demo.repository.PassengerRepository;
import com.example.demo.repository.PaymentRepository;

@Service
public class BookingService {

    private final BookingRepository bookingRepo;
    private final FlightRepository flightRepo;
    private final PassengerRepository passengerRepo;
    private final PaymentRepository paymentRepo;

    public BookingService(
            BookingRepository bookingRepo,
            FlightRepository flightRepo,
            PassengerRepository passengerRepo,
            PaymentRepository paymentRepo) {
        this.bookingRepo = bookingRepo;
        this.flightRepo = flightRepo;
        this.passengerRepo = passengerRepo;
        this.paymentRepo = paymentRepo;
    }

    public Booking bookFlight(com.example.demo.dto.BookingRequest request) {
        Flight flight = flightRepo.findById(request.getFlightId())
                .orElseThrow(() -> new RuntimeException("Flight not found"));

        Passenger passenger;
        if (request.getUsername() != null && !request.getUsername().isEmpty()) {
            passenger = passengerRepo.findByUsername(request.getUsername())
                    .orElseGet(() -> {
                        Passenger p = new Passenger();
                        p.setUsername(request.getUsername());
                        p.setEmail(request.getEmail());
                        p.setName(request.getName());
                        return passengerRepo.save(p);
                    });

            // Update passenger details if they changed during booking
            if (request.getName() != null && !request.getName().isEmpty()) {
                passenger.setName(request.getName());
            }
            if (request.getEmail() != null && !request.getEmail().isEmpty()) {
                passenger.setEmail(request.getEmail());
            }
            passenger = passengerRepo.save(passenger);
        } else if (request.getPassengerId() != null) {
            passenger = passengerRepo.findById(request.getPassengerId())
                    .orElseThrow(() -> new RuntimeException("Passenger not found"));
        } else {
            throw new RuntimeException("Either username or passengerId must be provided");
        }

        Booking booking = new Booking();
        booking.setFlight(flight);
        booking.setPassenger(passenger);
        booking.setSeatsBooked(request.getSeats());
        booking.setTotalAmount(request.getSeats() * flight.getPrice());
        booking.setStatus("PENDING");

        return bookingRepo.save(booking);
    }

    // -------------------------------
    // MAKE PAYMENT
    // -------------------------------
    public Payment makePayment(Long bookingId, String paymentMode) {

        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(booking.getTotalAmount());
        payment.setPaymentMode(paymentMode);
        payment.setStatus("SUCCESS"); // mock payment success
        payment.setTransactionId("TXN-" + System.currentTimeMillis());

        paymentRepo.save(payment);

        // Update booking status to CONFIRMED
        booking.setStatus("CONFIRMED");
        bookingRepo.save(booking);

        return payment;
    }

    public java.util.List<Booking> getBookingsByPassenger(Long passengerId) {
        return bookingRepo.findByPassengerId(passengerId);
    }
}
