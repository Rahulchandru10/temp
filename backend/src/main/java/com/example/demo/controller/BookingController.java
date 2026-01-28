package com.example.demo.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Booking;
import com.example.demo.model.Payment;
import com.example.demo.service.BookingService;

@RestController
@RequestMapping("/api/customer/booking")
@CrossOrigin(origins = "http://localhost:4200")
public class BookingController {

    private final BookingService service;

    public BookingController(BookingService service) {
        this.service = service;
    }

    @PostMapping
    public Booking book(@RequestBody com.example.demo.dto.BookingRequest request) {
        return service.bookFlight(request);
    }

    @PostMapping("/pay")
    public Payment pay(
            @RequestParam Long bookingId,
            @RequestParam String mode) {
        return service.makePayment(bookingId, mode);
    }

    @GetMapping("/{passengerId}")
    public java.util.List<Booking> getBookings(@PathVariable Long passengerId) {
        return service.getBookingsByPassenger(passengerId);
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{bookingId}")
    public void cancel(@PathVariable Long bookingId) {
        service.cancelBooking(bookingId);
    }
}
