package com.example.demo.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Aircraft;
import com.example.demo.model.Flight;
import com.example.demo.repository.AircraftRepository;
import com.example.demo.repository.FlightRepository;

@RestController
@RequestMapping("/auth")
@CrossOrigin
public class FlightController {

    private final FlightRepository flightRepo;
    private final AircraftRepository aircraftRepo;

    public FlightController(FlightRepository flightRepo,
            AircraftRepository aircraftRepo) {
        this.flightRepo = flightRepo;
        this.aircraftRepo = aircraftRepo;
    }

    // ---------------- ADMIN ----------------

    @PostMapping("/admin/create/flights")
    public Flight createFlight(@RequestBody com.example.demo.dto.FlightRequest request) {
        Flight flight = new Flight();
        mapRequestToEntity(request, flight);
        return flightRepo.save(flight);
    }

    @PutMapping("/admin/flights/{id}")
    public Flight updateFlight(@PathVariable Long id, @RequestBody com.example.demo.dto.FlightRequest request) {
        Flight flight = flightRepo.findById(id).orElseThrow();
        mapRequestToEntity(request, flight);
        return flightRepo.save(flight);
    }

    private void mapRequestToEntity(com.example.demo.dto.FlightRequest request, Flight flight) {
        flight.setFlightNumber(request.getFlightNumber());
        flight.setSource(request.getSource());
        flight.setDestination(request.getDestination());
        flight.setDepartureTime(request.getDepartureTime());
        flight.setArrivalTime(request.getArrivalTime());
        flight.setPrice(request.getPrice());

        if (request.getAircraftId() != null) {
            Aircraft aircraft = aircraftRepo.findById(request.getAircraftId()).orElseThrow();
            flight.setAircraft(aircraft);
        }
    }

    @GetMapping("/admin/flights")
    public List<Flight> getAllFlights() {
        return flightRepo.findAll();
    }

    @PutMapping("/admin/flights/{flightId}/assign-aircraft/{aircraftId}")
    public Flight assignAircraft(@PathVariable Long flightId,
            @PathVariable Long aircraftId) {

        Flight flight = flightRepo.findById(flightId).orElseThrow();
        Aircraft aircraft = aircraftRepo.findById(aircraftId).orElseThrow();

        // If status is null or empty, we'll consider it READY for assignment
        // or just allow the admin to override.
        if (aircraft.getStatus() != null && aircraft.getStatus().equalsIgnoreCase("MAINTENANCE")) {
            throw new RuntimeException("This aircraft is in MAINTENANCE and cannot be assigned to a flight.");
        }

        // Auto-set status to READY if it was empty/null during assignment
        if (aircraft.getStatus() == null || aircraft.getStatus().isEmpty()) {
            aircraft.setStatus("READY");
            aircraftRepo.save(aircraft);
        }

        flight.setAircraft(aircraft);
        return flightRepo.save(flight);
    }

    // ---------------- CUSTOMER ----------------

    @GetMapping("/customer/flights/search")
    public List<Flight> searchFlights(
            @RequestParam String source,
            @RequestParam String destination,
            @RequestParam String date) {

        LocalDate localDate = LocalDate.parse(date);
        LocalDateTime start = localDate.atStartOfDay();
        LocalDateTime end = localDate.atTime(23, 59);

        return flightRepo.findBySourceIgnoreCaseAndDestinationIgnoreCaseAndDepartureTimeBetweenAndStatus(
                source, destination, start, end, "READY");

    }
}
