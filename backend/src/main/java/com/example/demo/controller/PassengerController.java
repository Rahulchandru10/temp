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

    @GetMapping("/by-email")
    public Passenger getByEmail(@RequestParam String email) {
        return service.getPassengerByEmail(email);
    }

    @PostMapping("/checkin")
    public java.util.Map<String, Object> checkIn(
            @RequestParam Long passengerId,
            @RequestParam String seat) {
        BoardingPass pass = service.checkIn(passengerId, seat);
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("boardingPass", pass);
        return response;
    }

    @GetMapping("/boardingpass/{passengerId}")
    public BoardingPass getBoardingPass(@PathVariable Long passengerId) {
        return service.getBoardingPassByPassengerId(passengerId);
    }
}
