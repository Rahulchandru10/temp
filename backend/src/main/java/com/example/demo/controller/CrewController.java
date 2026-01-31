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

        java.util.List<CrewAssignment> existingAssignments = assignmentRepo.findByFlightId(flightId);

        // 1. Limit max crew members to 4
        if (existingAssignments.size() >= 4) {
            throw new RuntimeException("Maximum of 4 crew members can be assigned to a flight.");
        }

        // 2. Prevent multiple crew members with the same role
        for (CrewAssignment caExisting : existingAssignments) {
            if (caExisting.getCrew().getRole().equalsIgnoreCase(crew.getRole())) {
                throw new RuntimeException("Duplicate role cannot be assigned.");
            }
        }

        CrewAssignment ca = new CrewAssignment();
        ca.setCrew(crew);
        ca.setFlight(flight);

        crew.setAvailable(false);
        crewRepo.save(crew);
        assignmentRepo.save(ca);

        updateFlightStatus(flight);

        return ca;
    }

    private void updateFlightStatus(Flight flight) {
        java.util.List<CrewAssignment> assignments = assignmentRepo.findByFlightId(flight.getId());
        java.util.Set<String> roles = new java.util.HashSet<>();
        for (CrewAssignment a : assignments) {
            roles.add(a.getCrew().getRole());
        }

        if (roles.size() >= 4) {
            flight.setStatus("READY");
        } else {
            flight.setStatus("Not Ready");
        }
        flightRepo.save(flight);
    }

    // Update crew member
    @PutMapping("/{id}")
    public Crew updateCrew(@PathVariable Long id, @RequestBody Crew crewDetails) {
        Crew crew = crewRepo.findById(id).orElseThrow();
        crew.setName(crewDetails.getName());
        crew.setRole(crewDetails.getRole());
        crew.setAvailable(crewDetails.isAvailable());
        return crewRepo.save(crew);
    }

    // Delete crew member
    @DeleteMapping("/{id}")
    public void deleteCrew(@PathVariable Long id) {
        Crew crew = crewRepo.findById(id).orElseThrow();
        // Delete assignments first if any
        assignmentRepo.findByCrewId(id).ifPresent(assignmentRepo::delete);
        crewRepo.delete(crew);
    }

    // Unassign crew from flight
    @DeleteMapping("/unassign/{crewId}")
    public void unassignCrew(@PathVariable Long crewId) {
        Crew crew = crewRepo.findById(crewId).orElseThrow();

        CrewAssignment assignment = assignmentRepo.findByCrewId(crewId)
                .orElseThrow(() -> new RuntimeException("No assignment found for this crew"));

        Flight flight = assignment.getFlight();
        assignmentRepo.delete(assignment);

        crew.setAvailable(true);
        crewRepo.save(crew);

        updateFlightStatus(flight);
    }
}
