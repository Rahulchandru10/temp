package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.model.Crew;
import com.example.demo.model.Flight;
import com.example.demo.model.FlightCrew;
import com.example.demo.repository.CrewRepository;
import com.example.demo.repository.FlightCrewRepository;
import com.example.demo.repository.FlightRepository;

@Service
public class CrewService {

    private final CrewRepository crewRepo;
    private final FlightRepository flightRepo;
    private final FlightCrewRepository flightCrewRepo;

    public CrewService(
            CrewRepository crewRepo,
            FlightRepository flightRepo,
            FlightCrewRepository flightCrewRepo
    ) {
        this.crewRepo = crewRepo;
        this.flightRepo = flightRepo;
        this.flightCrewRepo = flightCrewRepo;
    }

    public Crew addCrew(Crew crew) {
        crew.setAvailable(true);
        return crewRepo.save(crew);
    }

    public List<Crew> getAvailableCrew() {
        return crewRepo.findByAvailableTrue();
    }

    public void assignCrew(Long flightId, Long crewId) {
        Flight flight = flightRepo.findById(flightId)
                .orElseThrow(() -> new RuntimeException("Flight not found"));

        Crew crew = crewRepo.findById(crewId)
                .orElseThrow(() -> new RuntimeException("Crew not found"));

        if (!crew.isAvailable()) {
            throw new RuntimeException("Crew not available");
        }

        FlightCrew fc = new FlightCrew();
        fc.setFlight(flight);
        fc.setCrew(crew);

        crew.setAvailable(false);

        flightCrewRepo.save(fc);
        crewRepo.save(crew);
    }
}
