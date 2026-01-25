package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;
import com.example.demo.model.*;
import com.example.demo.repository.*;

import java.util.List;

@RestController
@RequestMapping("/auth/admin/readiness")
@CrossOrigin
public class AircraftReadinessController {

    private final FlightRepository flightRepo;
    private final CrewAssignmentRepository crewAssignRepo;

    public AircraftReadinessController(
            FlightRepository flightRepo,
            CrewAssignmentRepository crewAssignRepo) {
        this.flightRepo = flightRepo;
        this.crewAssignRepo = crewAssignRepo;
    }

    @GetMapping("/{flightId}")
    public com.example.demo.dto.ReadinessResponse checkReadiness(@PathVariable Long flightId) {
        Flight flight = flightRepo.findById(flightId).orElseThrow();

        if (flight.getAircraft() == null) {
            flight.setStatus("NOT READY");
            flightRepo.save(flight);
            return new com.example.demo.dto.ReadinessResponse(flightId, false,
                    "Flight not ready: No aircraft assigned");
        }

        List<CrewAssignment> assignments = crewAssignRepo.findAll();
        long assignedCrew = assignments.stream()
                .filter(a -> a.getFlight().getId().equals(flightId))
                .count();

        if (assignedCrew < 4) {
            flight.setStatus("NOT READY");
            flightRepo.save(flight);
            return new com.example.demo.dto.ReadinessResponse(flightId, false,
                    "Flight not ready: Crew incomplete (Required: 4, Assigned: " + assignedCrew + ")");
        }

        flight.setStatus("READY");
        flightRepo.save(flight);
        return new com.example.demo.dto.ReadinessResponse(flightId, true, "Flight ready for departure");
    }
}
