package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.model.User;
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
    private final PasswordEncoder encoder;

    public AuthController(UserRepository userRepo,
            PasswordEncoder encoder) {
        this.userRepo = userRepo;
        this.encoder = encoder;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepo.findByUsername(request.getUsername());
        if (userOpt.isEmpty() || !encoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        User user = userOpt.get();
        String token = JwtUtil.generateToken(user.getUsername(), user.getRole(), user.getEmail(), user.getFullName());
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
        user.setEmail(request.getEmail());
        user.setFullName(request.getName());
        user.setRole("CUSTOMER");
        user.setEnabled(true);
        userRepo.save(user);

        return user;
    }

    @PostMapping("/register/admin")
    public User registeradmin(@RequestBody User user) {
        user.setRole("ADMIN");
        user.setPassword(encoder.encode(user.getPassword()));
        return userRepo.save(user);
    }
}
