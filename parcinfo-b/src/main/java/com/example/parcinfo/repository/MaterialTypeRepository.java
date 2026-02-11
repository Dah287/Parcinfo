package com.example.parcinfo.repository;


import com.example.parcinfo.model.MaterialType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MaterialTypeRepository extends JpaRepository<MaterialType, Long> {

    Optional<MaterialType> findByDesignation(String designation);

    boolean existsByDesignation(String designation);
}