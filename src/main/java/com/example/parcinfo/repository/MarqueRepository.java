package com.example.parcinfo.repository;


import com.example.parcinfo.model.Marque;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MarqueRepository extends JpaRepository<Marque, Long> {

    Optional<Marque> findByNom(String nom);

    boolean existsByNom(String nom);
}