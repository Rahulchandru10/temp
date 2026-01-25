package com.example.demo.controller;
import java.util.UUID;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Booking;
import com.example.demo.model.Payment;
import com.example.demo.repository.BookingRepository;
import com.example.demo.repository.PaymentRepository;

@RestController
@RequestMapping("/customer/payments")
@CrossOrigin
public class PaymentController {

    private final PaymentRepository paymentRepo;
    private final BookingRepository bookingRepo;

    public PaymentController(PaymentRepository paymentRepo,
                             BookingRepository bookingRepo) {
        this.paymentRepo = paymentRepo;
        this.bookingRepo = bookingRepo;
    }

    @PostMapping("/{bookingId}")
    public Payment makePayment(@PathVariable Long bookingId,
                               @RequestParam String mode) {

        Booking booking = bookingRepo.findById(bookingId).orElseThrow();

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setPaymentMode(mode);
        payment.setStatus("SUCCESS");
        payment.setTransactionId(UUID.randomUUID().toString());

        return paymentRepo.save(payment);
    }
}
