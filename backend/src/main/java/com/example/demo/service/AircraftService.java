package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.model.Aircraft;
import com.example.demo.repository.AircraftRepository;

@Service
public class AircraftService {

    private final AircraftRepository repo;

    public AircraftService(AircraftRepository repo) {
        this.repo = repo;
    }

    public List<Aircraft> getAll() {
        return repo.findAll();
    }

    public Aircraft save(Aircraft aircraft) {
        return repo.save(aircraft);
    }

    public Aircraft update(Long id, Aircraft updated) {
        Aircraft existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Aircraft not found"));

        existing.setModel(updated.getModel());
        existing.setCapacity(updated.getCapacity());
        existing.setStatus(updated.getStatus());

        return repo.save(existing);
    }
}
