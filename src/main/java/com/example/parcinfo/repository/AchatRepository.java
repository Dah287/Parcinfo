package com.example.parcinfo.repository;

import com.example.parcinfo.model.Achat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AchatRepository extends JpaRepository<Achat, Long> {

    Optional<Achat> findByReference(String reference);

    boolean existsByReference(String reference);

    List<Achat> findByType(Achat.TypeAchat type);

    List<Achat> findByDateBetween(LocalDate startDate, LocalDate endDate);

    List<Achat> findByFournisseurId(Long fournisseurId);

    @Query("SELECT a FROM Achat a WHERE " +
            "LOWER(a.reference) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(a.fournisseur.nom) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Achat> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT SUM(p.prixUnitaireHT * p.quantite) FROM Achat a JOIN a.prixList p WHERE a.date BETWEEN :start AND :end")
    Double getTotalMontantHTBetweenDates(@Param("start") LocalDate start, @Param("end") LocalDate end);
}