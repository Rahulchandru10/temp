package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "boarding_passes")
public class BoardingPass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String boardingNumber; // unique boarding pass number

    @ManyToOne
    private Booking booking; // link to specific booking

    @ManyToOne
    private BookingPassenger bookingPassenger; // link to specific passenger in booking

    private String gate; // boarding gate
    private String seatNumber; // seat assigned during check-in
    private LocalDateTime boardingTime; // check-in time
    private String status; // ACTIVE / USED / CANCELLED

    public BoardingPass() {
    }

    public Long getId() {
        return id;
    }

    public String getBoardingNumber() {
        return boardingNumber;
    }

    public void setBoardingNumber(String boardingNumber) {
        this.boardingNumber = boardingNumber;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public BookingPassenger getBookingPassenger() {
        return bookingPassenger;
    }

    public void setBookingPassenger(BookingPassenger bookingPassenger) {
        this.bookingPassenger = bookingPassenger;
    }

    public String getGate() {
        return gate;
    }

    public void setGate(String gate) {
        this.gate = gate;
    }

    public String getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(String seatNumber) {
        this.seatNumber = seatNumber;
    }

    public LocalDateTime getBoardingTime() {
        return boardingTime;
    }

    public void setBoardingTime(LocalDateTime boardingTime) {
        this.boardingTime = boardingTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
