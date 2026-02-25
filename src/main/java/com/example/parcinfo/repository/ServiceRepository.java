package com.example.parcinfo.repository;

import com.example.parcinfo.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    Optional<Service> findByName(String name);
    boolean existsByName(String name);
    List<Service> findByNameContainingIgnoreCase(String keyword);
}