package com.example.demo.repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.BoardingPass;
public interface BoardingPassRepository extends JpaRepository<BoardingPass, Long> {
}
