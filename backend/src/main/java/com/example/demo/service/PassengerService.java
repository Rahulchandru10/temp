package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.demo.model.BoardingPass;
import com.example.demo.model.Passenger;
import com.example.demo.repository.BoardingPassRepository;
import com.example.demo.repository.PassengerRepository;

@Service
public class PassengerService {

    private final PassengerRepository passengerRepo;
    private final BoardingPassRepository boardingRepo;

    public PassengerService(
            PassengerRepository passengerRepo,
            BoardingPassRepository boardingRepo) {
        this.passengerRepo = passengerRepo;
        this.boardingRepo = boardingRepo;
    }

    public Passenger getPassengerByEmail(String email) {
        return passengerRepo.findByEmail(email).orElseGet(() -> {
            Passenger p = new Passenger();
            p.setEmail(email);
            p.setName(email.split("@")[0]); // Default name from email
            return passengerRepo.save(p);
        });
    }

    public BoardingPass getBoardingPassByPassengerId(Long passengerId) {
        return boardingRepo.findAll().stream()
                .filter(bp -> bp.getPassenger().getId().equals(passengerId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Boarding pass not found"));
    }

    public Passenger addPassenger(Passenger passenger) {
        passenger.setCheckedIn(false);
        return passengerRepo.save(passenger);
    }

    public BoardingPass checkIn(Long passengerId, String seatNumber) {

        Passenger passenger = passengerRepo.findById(passengerId)
                .orElseThrow(() -> new RuntimeException("Passenger not found"));

        passenger.setCheckedIn(true);
        passenger.setSeatNumber(seatNumber);

        BoardingPass pass = new BoardingPass();
        pass.setBoardingNumber("BP-" + UUID.randomUUID());
        pass.setPassenger(passenger);
        pass.setSeatNumber(seatNumber);
        pass.setGate("G" + (int) (Math.random() * 10));
        pass.setBoardingTime(LocalDateTime.now());
        pass.setStatus("ACTIVE");

        passengerRepo.save(passenger);
        return boardingRepo.save(pass);
    }
}
