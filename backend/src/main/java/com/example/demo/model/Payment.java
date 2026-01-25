package com.example.demo.model;
import jakarta.persistence.*;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String transactionId;   // ✅ ADD THIS

    private String paymentMode; // CARD, UPI, NETBANKING
    private double amount;
    private String status; // SUCCESS, FAILED

    @OneToOne
    private Booking booking;

    public Payment() {}

    public Long getId() {
        return id;
    }

    public String getTransactionId() {     // ✅ ADD
        return transactionId;
    }

    public void setTransactionId(String transactionId) {   // ✅ ADD
        this.transactionId = transactionId;
    }

    public String getPaymentMode() {
        return paymentMode;
    }

    public void setPaymentMode(String paymentMode) {
        this.paymentMode = paymentMode;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }
}
