package com.example.parcinfo.repository;

import com.example.parcinfo.model.DemandeReaffectation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface DemandeReaffectationRepository extends JpaRepository<DemandeReaffectation, Long> {

    List<DemandeReaffectation> findByStatut(DemandeReaffectation.StatutDemande statut);

    List<DemandeReaffectation> findByDemandeurId(Long demandeurId);

    List<DemandeReaffectation> findByValidateurId(Long validateurId);

//    // ✅ Méthode avec @Query explicite
//    @Query("SELECT d FROM DemandeReaffectation d WHERE d.statut = :statut AND d.validateur.id = :validateurId")
//    List<DemandeReaffectation> findByStatutAndValidateurId(
//            @Param("statut") DemandeReaffectation.StatutDemande statut,
//            @Param("validateurId") Long validateurId);

//    // ✅ Méthode pour récupérer toutes les demandes d'un utilisateur
//    @Query("SELECT d FROM DemandeReaffectation d WHERE d.demandeur.id = :userId OR d.validateur.id = :userId")
//    List<DemandeReaffectation> findByDemandeurIdOrValidateurId(@Param("userId") Long userId);

    List<DemandeReaffectation> findByStatutAndValidateurId(DemandeReaffectation.StatutDemande statut, Long validateurId);

    @Query("SELECT d FROM DemandeReaffectation d WHERE d.demandeur.id = :userId OR d.validateur.id = :userId")
    List<DemandeReaffectation> findByDemandeurIdOrValidateurId(@Param("userId") Long userId);

    @Query("SELECT d FROM DemandeReaffectation d WHERE d.validateur.id = :validateurId AND d.statut = :statut")
    List<DemandeReaffectation> findByValidateurIdAndStatut(@Param("validateurId") Long validateurId, @Param("statut") DemandeReaffectation.StatutDemande statut);

}