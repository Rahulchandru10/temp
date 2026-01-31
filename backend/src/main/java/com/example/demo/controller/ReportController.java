package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;
import com.example.demo.model.*;
import com.example.demo.repository.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/reports")
@CrossOrigin
public class ReportController {

    private final FlightRepository flightRepo;
    private final BookingRepository bookingRepo;

    public ReportController(FlightRepository flightRepo, BookingRepository bookingRepo) {
        this.flightRepo = flightRepo;
        this.bookingRepo = bookingRepo;
    }

    @GetMapping("/summary")
    public Map<String, Object> getReportSummary() {
        Map<String, Object> report = new HashMap<>();

        List<Flight> flights = flightRepo.findAll();
        List<Booking> bookings = bookingRepo.findAll().stream()
                .filter(b -> "CONFIRMED".equals(b.getStatus()))
                .collect(Collectors.toList());

        long totalFlights = flights.size();

        double totalRevenue = bookings.stream().mapToDouble(Booking::getTotalAmount).sum();

        report.put("totalFlights", totalFlights);
        report.put("totalRevenue", totalRevenue);

        return report;
    }

    @GetMapping("/flights")
    public List<Map<String, Object>> getFlightReport() {
        return flightRepo.findAll().stream().map(f -> {
            Map<String, Object> m = new HashMap<>();
            m.put("flightNumber", f.getFlightNumber());
            m.put("source", f.getSource());
            m.put("destination", f.getDestination());
            m.put("status", f.getStatus());
            return m;
        }).collect(Collectors.toList());
    }

    @GetMapping("/revenue-by-flight")
    public List<Map<String, Object>> getRevenueByFlight() {
        List<Booking> confirmedBookings = bookingRepo.findAll().stream()
                .filter(b -> "CONFIRMED".equals(b.getStatus()))
                .collect(Collectors.toList());

        Map<Long, Double> revenueMap = confirmedBookings.stream()
                .collect(Collectors.groupingBy(b -> b.getFlight().getId(),
                        Collectors.summingDouble(Booking::getTotalAmount)));

        return revenueMap.entrySet().stream().map(e -> {
            Flight f = flightRepo.findById(e.getKey()).orElse(null);
            Map<String, Object> m = new HashMap<>();
            if (f != null) {
                m.put("flightNumber", f.getFlightNumber());
                m.put("route", f.getSource() + " → " + f.getDestination());

                int capacity = f.getAircraft() != null ? f.getAircraft().getCapacity() : 0;
                int bookedSeats = bookingRepo.findByFlightId(f.getId()).stream()
                        .filter(b -> "CONFIRMED".equals(b.getStatus()))
                        .mapToInt(Booking::getSeatsBooked)
                        .sum();
                m.put("seatsFilled", bookedSeats + "/" + capacity);
            } else {
                m.put("flightNumber", "Unknown");
                m.put("route", "N/A");
                m.put("seatsFilled", "0/0");
            }
            m.put("revenue", e.getValue());
            return m;
        }).collect(Collectors.toList());
    }
}
