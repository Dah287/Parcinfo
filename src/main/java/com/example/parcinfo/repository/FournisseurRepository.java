package com.example.parcinfo.repository;


import com.example.parcinfo.model.Fournisseur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FournisseurRepository extends JpaRepository<Fournisseur, Long> {

    Optional<Fournisseur> findByCode(String code);

    boolean existsByCode(String code);

    Optional<Fournisseur> findByNom(String nom);

    @Query("SELECT f FROM Fournisseur f WHERE " +
            "LOWER(f.code) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(f.nom) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Fournisseur> searchByKeyword(@Param("keyword") String keyword);
}