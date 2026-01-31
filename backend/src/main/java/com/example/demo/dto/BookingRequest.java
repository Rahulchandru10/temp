package com.example.demo.dto;

public class BookingRequest {
    private Long flightId;
    private Long passengerId;
    private String username;
    private int seats;
    private String name;
    private String email;
    private java.util.List<PassengerDetail> passengerDetails;

    public static class PassengerDetail {
        private String name;
        private int age;
        private String gender;
        private String contact;
        private String passportId;
        private String email;

        public PassengerDetail() {
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public int getAge() {
            return age;
        }

        public void setAge(int age) {
            this.age = age;
        }

        public String getGender() {
            return gender;
        }

        public void setGender(String gender) {
            this.gender = gender;
        }

        public String getContact() {
            return contact;
        }

        public void setContact(String contact) {
            this.contact = contact;
        }

        public String getPassportId() {
            return passportId;
        }

        public void setPassportId(String passportId) {
            this.passportId = passportId;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }

    public BookingRequest() {
    }

    public Long getFlightId() {
        return flightId;
    }

    public void setFlightId(Long flightId) {
        this.flightId = flightId;
    }

    public Long getPassengerId() {
        return passengerId;
    }

    public void setPassengerId(Long passengerId) {
        this.passengerId = passengerId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public int getSeats() {
        return seats;
    }

    public void setSeats(int seats) {
        this.seats = seats;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public java.util.List<PassengerDetail> getPassengerDetails() {
        return passengerDetails;
    }

    public void setPassengerDetails(java.util.List<PassengerDetail> passengerDetails) {
        this.passengerDetails = passengerDetails;
    }
}
