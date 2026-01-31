package com.example.demo.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.BoardingPass;
import com.example.demo.model.Passenger;
import com.example.demo.service.PassengerService;

@RestController
@RequestMapping("/api/customer/passenger")
@CrossOrigin(origins = "http://localhost:4200")
public class PassengerController {

    private final PassengerService service;

    public PassengerController(PassengerService service) {
        this.service = service;
    }

    @PostMapping
    public Passenger add(@RequestBody Passenger passenger) {
        return service.addPassenger(passenger);
    }

    @GetMapping("/by-username")
    public Passenger getByUsername(@RequestParam String username) {
        return service.getPassengerByUsername(username);
    }

    @PostMapping("/checkin")
    public java.util.Map<String, Object> checkIn(
            @RequestParam Long bookingId,
            @RequestParam String seat) {
        java.util.List<BoardingPass> passes = service.checkIn(bookingId, seat);
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("boardingPasses", passes);
        return response;
    }

    @GetMapping("/boardingpass/{bookingId}")
    public java.util.List<BoardingPass> getBoardingPass(@PathVariable Long bookingId) {
        return service.getBoardingPassByBookingId(bookingId);
    }
}
