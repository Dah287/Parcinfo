package com.example.parcinfo.repository;

import com.example.parcinfo.model.Beneficiaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BeneficiaireRepository extends JpaRepository<Beneficiaire, Long> {

    Optional<Beneficiaire> findByMatricule(String matricule);

    boolean existsByMatricule(String matricule);

    boolean existsByNomAndPrenom(String nom, String prenom);

    @Query("SELECT b FROM Beneficiaire b WHERE " +
            "LOWER(b.nom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(b.prenom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(b.matricule) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(b.bureau.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(b.department.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(b.service.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Beneficiaire> searchByKeyword(@Param("keyword") String keyword);

    // Ces méthodes sont OK car elles utilisent des IDs
    List<Beneficiaire> findByBureauId(Long bureauId);
    List<Beneficiaire> findByDepartmentId(Long departmentId);
    List<Beneficiaire> findByServiceId(Long serviceId);

    // Supprimez cette méthode si elle existe - elle utilise 'code'
    // Optional<Bureau> findByCode(String code);

    // Supprimez cette méthode si elle existe
    // boolean existsByCode(String code);
}