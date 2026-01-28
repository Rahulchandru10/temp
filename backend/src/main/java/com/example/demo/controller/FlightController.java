package com.example.demo.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
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
    private final com.example.demo.repository.BookingRepository bookingRepo;

    public FlightController(FlightRepository flightRepo,
            AircraftRepository aircraftRepo,
            com.example.demo.repository.BookingRepository bookingRepo) {
        this.flightRepo = flightRepo;
        this.aircraftRepo = aircraftRepo;
        this.bookingRepo = bookingRepo;
    }

    // ---------------- ADMIN ----------------

    @PostMapping("/admin/create/flights")
    public Flight createFlight(@RequestBody com.example.demo.dto.FlightRequest request) {
        validateFlight(request, null);
        Flight flight = new Flight();
        mapRequestToEntity(request, flight);
        return flightRepo.save(flight);
    }

    @PutMapping("/admin/flights/{id}")
    public Flight updateFlight(@PathVariable Long id, @RequestBody com.example.demo.dto.FlightRequest request) {
        validateFlight(request, id);
        Flight flight = flightRepo.findById(id).orElseThrow();
        mapRequestToEntity(request, flight);
        return flightRepo.save(flight);
    }

    private void validateFlight(com.example.demo.dto.FlightRequest request, Long editingId) {
        // 1. Duplicate Flight Scheduling Restriction
        List<Flight> duplicateFlights = flightRepo.findBySourceIgnoreCaseAndDestinationIgnoreCaseAndDepartureTime(
                request.getSource(), request.getDestination(), request.getDepartureTime());

        for (Flight f : duplicateFlights) {
            if (editingId == null || !f.getId().equals(editingId)) {
                throw new RuntimeException(
                        "A flight with the same source, destination, and departure time already exists.");
            }
        }

        // 2. Aircraft Usage Restriction
        if (request.getAircraftId() != null) {
            List<Flight> flightsWithThisAircraft = flightRepo.findByAircraftId(request.getAircraftId());
            for (Flight f : flightsWithThisAircraft) {
                if (editingId == null || !f.getId().equals(editingId)) {
                    throw new RuntimeException("This aircraft is already assigned to another flight.");
                }
            }
        }
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

    @DeleteMapping("/admin/flights/{id}")
    @org.springframework.transaction.annotation.Transactional
    public void deleteFlight(@PathVariable Long id) {
        flightRepo.deleteById(id);
    }

    @GetMapping("/admin/aircraft/available")
    public List<Aircraft> getAvailableAircraft(@RequestParam(required = false) Long excludeFlightId) {
        List<Aircraft> allAircraft = aircraftRepo.findAll();
        List<Flight> allFlights = flightRepo.findAll();
        java.util.Set<Long> usedAircraftIds = allFlights.stream()
                .filter(f -> f.getAircraft() != null)
                .filter(f -> excludeFlightId == null || !f.getId().equals(excludeFlightId))
                .map(f -> f.getAircraft().getId())
                .collect(java.util.stream.Collectors.toSet());

        return allAircraft.stream()
                .filter(a -> !usedAircraftIds.contains(a.getId()))
                .collect(java.util.stream.Collectors.toList());
    }

    // ---------------- CUSTOMER ----------------

    @GetMapping("/customer/flights/search")
    public List<java.util.Map<String, Object>> searchFlights(
            @RequestParam String source,
            @RequestParam String destination,
            @RequestParam String date) {

        LocalDate localDate = LocalDate.parse(date);
        LocalDateTime start = localDate.atStartOfDay();
        LocalDateTime end = localDate.atTime(23, 59);

        List<Flight> flights = flightRepo
                .findBySourceIgnoreCaseAndDestinationIgnoreCaseAndDepartureTimeBetweenAndStatus(
                        source, destination, start, end, "READY");

        return flights.stream().map(f -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", f.getId());
            map.put("flightNumber", f.getFlightNumber());
            map.put("source", f.getSource());
            map.put("destination", f.getDestination());
            map.put("departureTime", f.getDepartureTime());
            map.put("arrivalTime", f.getArrivalTime());
            map.put("price", f.getPrice());
            map.put("status", f.getStatus());

            int capacity = f.getAircraft() != null ? f.getAircraft().getCapacity() : 0;
            int bookedSeats = bookingRepo.findByFlightId(f.getId()).stream()
                    .filter(b -> !"CANCELLED".equals(b.getStatus()))
                    .mapToInt(com.example.demo.model.Booking::getSeatsBooked)
                    .sum();

            map.put("availableSeats", Math.max(0, capacity - bookedSeats));
            map.put("aircraft", f.getAircraft());
            return map;
        }).collect(java.util.stream.Collectors.toList());
    }
}
