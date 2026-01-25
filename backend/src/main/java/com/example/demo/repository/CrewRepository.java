package com.example.demo.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.Crew;

public interface CrewRepository extends JpaRepository<Crew, Long> {

    List<Crew> findByAvailableTrue();
}
