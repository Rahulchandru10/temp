package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;
import com.example.demo.model.*;
import com.example.demo.repository.*;

@RestController
@RequestMapping("/api/admin/crew")
@CrossOrigin
public class CrewController {

    private final CrewRepository crewRepo;
    private final FlightRepository flightRepo;
    private final CrewAssignmentRepository assignmentRepo;

    public CrewController(
            CrewRepository crewRepo,
            FlightRepository flightRepo,
            CrewAssignmentRepository assignmentRepo) {
        this.crewRepo = crewRepo;
        this.flightRepo = flightRepo;
        this.assignmentRepo = assignmentRepo;
    }

    // Add crew member
    @PostMapping
    public Crew addCrew(@RequestBody Crew crew) {
        return crewRepo.save(crew);
    }

    // Get all crew members
    @GetMapping
    public java.util.List<Crew> getAllCrew() {
        return crewRepo.findAll();
    }

    // Assign crew to flight
    @PostMapping("/assign/{crewId}/{flightId}")
    public CrewAssignment assignCrew(
            @PathVariable Long crewId,
            @PathVariable Long flightId) {

        Crew crew = crewRepo.findById(crewId).orElseThrow();
        Flight flight = flightRepo.findById(flightId).orElseThrow();

        if (!crew.isAvailable()) {
            throw new RuntimeException("Crew not available");
        }

        CrewAssignment ca = new CrewAssignment();
        ca.setCrew(crew);
        ca.setFlight(flight);

        crew.setAvailable(false);
        crewRepo.save(crew);

        return assignmentRepo.save(ca);
    }

    // Unassign crew from flight
    @DeleteMapping("/unassign/{crewId}")
    public void unassignCrew(@PathVariable Long crewId) {
        Crew crew = crewRepo.findById(crewId).orElseThrow();

        CrewAssignment assignment = assignmentRepo.findByCrewId(crewId)
                .orElseThrow(() -> new RuntimeException("No assignment found for this crew"));

        assignmentRepo.delete(assignment);

        crew.setAvailable(true);
        crewRepo.save(crew);
    }
}
