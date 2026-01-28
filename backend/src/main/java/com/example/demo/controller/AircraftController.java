package com.example.demo.controller;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Aircraft;
import com.example.demo.repository.AircraftRepository;

@RestController
@RequestMapping("/admin/aircraft")
@CrossOrigin
public class AircraftController {

    private final AircraftRepository repo;

    public AircraftController(AircraftRepository repo) {
        this.repo = repo;
    }

    @PostMapping("create")
    @Transactional
    public Aircraft addAircraft(@RequestBody Aircraft aircraft) {
        return repo.save(aircraft);
    }

    @GetMapping("/getall")
    public List<Aircraft> getAll() {
        return repo.findAll();
    }

    @PutMapping("/{id}/status")
    @Transactional
    public Aircraft updateStatus(@PathVariable Long id,
            @RequestParam String status) {

        Aircraft a = repo.findById(id).orElseThrow();
        a.setStatus(status);
        return repo.save(a);
    }

    @PutMapping("/{id}")
    @Transactional
    public Aircraft updateAircraft(@PathVariable Long id, @RequestBody Aircraft aircraft) {
        Aircraft existing = repo.findById(id).orElseThrow();
        if (aircraft.getName() != null) {
            existing.setName(aircraft.getName());
        }
        if (aircraft.getModel() != null) {
            existing.setModel(aircraft.getModel());
        }
        if (aircraft.getCapacity() > 0) {
            existing.setCapacity(aircraft.getCapacity());
        }
        return repo.save(existing);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void deleteAircraft(@PathVariable Long id) {
        repo.deleteById(id);
    }
}
