package com.example.demo.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.example.demo.model.Crew;
import com.example.demo.repository.CrewRepository;

@Service
public class CrewService {

    private final CrewRepository crewRepo;

    public CrewService(CrewRepository crewRepo) {
        this.crewRepo = crewRepo;
    }

    public Crew addCrew(Crew crew) {
        crew.setAvailable(true);
        return crewRepo.save(crew);
    }

    public List<Crew> getAvailableCrew() {
        return crewRepo.findByAvailableTrue();
    }
}
