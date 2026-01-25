package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "crew_assignments")
public class CrewAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Crew crew;

    @ManyToOne
    private Flight flight;

    public CrewAssignment() {}

    public Long getId() {
        return id;
    }

    public Crew getCrew() {
        return crew;
    }

    public void setCrew(Crew crew) {
        this.crew = crew;
    }

    public Flight getFlight() {
        return flight;
    }

    public void setFlight(Flight flight) {
        this.flight = flight;
    }
}
