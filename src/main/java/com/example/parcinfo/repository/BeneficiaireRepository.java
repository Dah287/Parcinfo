package com.example.parcinfo.repository;


import com.example.parcinfo.model.Beneficiaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BeneficiaireRepository extends JpaRepository<Beneficiaire, Long> {

    List<Beneficiaire> findByDepartement(String departement);

    @Query("SELECT b FROM Beneficiaire b WHERE " +
            "LOWER(b.nom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(b.prenom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(b.departement) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Beneficiaire> searchByKeyword(@Param("keyword") String keyword);




    boolean existsByNomAndPrenom(String nom, String prenom);
}