package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.model.Passenger;
import com.example.demo.model.User;
import com.example.demo.repository.PassengerRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.util.JwtUtil;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/auth")
@CrossOrigin
public class AuthController {

    private final UserRepository userRepo;
    private final PassengerRepository passengerRepo;
    private final PasswordEncoder encoder;

    public AuthController(UserRepository userRepo,
            PassengerRepository passengerRepo,
            PasswordEncoder encoder) {
        this.userRepo = userRepo;
        this.passengerRepo = passengerRepo;
        this.encoder = encoder;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepo.findByUsername(request.getUsername());
        if (userOpt.isEmpty() || !encoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        User user = userOpt.get();
        String token = JwtUtil.generateToken(user.getUsername(), user.getRole());
        return new LoginResponse(token, user.getRole());
    }

    @PostMapping("/register")
    @Transactional
    public User register(@RequestBody RegisterRequest request) {
        if (userRepo.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(encoder.encode(request.getPassword()));
        user.setRole("CUSTOMER");
        user.setEnabled(true);
        userRepo.save(user);

        // Also create a passenger profile for history tracking
        Passenger passenger = new Passenger();
        passenger.setName(request.getName());
        passenger.setEmail(request.getEmail());
        passengerRepo.save(passenger);

        return user;
    }

    @PostMapping("/register/admin")
    public User registeradmin(@RequestBody User user) {
        user.setRole("ADMIN");
        user.setPassword(encoder.encode(user.getPassword()));
        return userRepo.save(user);
    }
}
