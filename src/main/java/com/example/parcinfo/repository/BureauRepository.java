package com.example.parcinfo.repository;

import com.example.parcinfo.model.Bureau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BureauRepository extends JpaRepository<Bureau, Long> {
    Optional<Bureau> findByName(String name);
    boolean existsByName(String name);
    List<Bureau> findByNameContainingIgnoreCase(String keyword);
}