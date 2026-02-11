package com.example.parcinfo.repository;



import com.example.parcinfo.model.Beneficiaire;
import com.example.parcinfo.model.HistoriqueAttribution;
import com.example.parcinfo.model.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HistoriqueAttributionRepository extends JpaRepository<HistoriqueAttribution, Long> {

    List<HistoriqueAttribution> findByMateriel(Material materiel);

    List<HistoriqueAttribution> findByMaterielIdOrderByDateOperationDesc(Long materielId);

    List<HistoriqueAttribution> findByNouveauBeneficiaire(Beneficiaire beneficiaire);

    List<HistoriqueAttribution> findByNouveauBeneficiaireIdOrderByDateOperationDesc(Long beneficiaireId);

    List<HistoriqueAttribution> findByAncienBeneficiaireIdOrderByDateOperationDesc(Long beneficiaireId);

    @Query("SELECT h FROM HistoriqueAttribution h WHERE h.dateOperation BETWEEN :dateDebut AND :dateFin ORDER BY h.dateOperation DESC")
    List<HistoriqueAttribution> findByDateOperationBetween(
            @Param("dateDebut") LocalDateTime dateDebut,
            @Param("dateFin") LocalDateTime dateFin);

    long countByMaterielId(Long materielId);

    long countByNouveauBeneficiaireId(Long beneficiaireId);
}