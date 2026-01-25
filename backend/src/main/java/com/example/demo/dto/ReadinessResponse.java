package com.example.demo.dto;

public class ReadinessResponse {
    private Long flightId;
    private boolean isReady;
    private String message;

    public ReadinessResponse(Long flightId, boolean isReady, String message) {
        this.flightId = flightId;
        this.isReady = isReady;
        this.message = message;
    }

    // Getters and Setters
    public Long getFlightId() {
        return flightId;
    }

    public void setFlightId(Long flightId) {
        this.flightId = flightId;
    }

    public boolean isIsReady() {
        return isReady;
    }

    public void setIsReady(boolean ready) {
        isReady = ready;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
