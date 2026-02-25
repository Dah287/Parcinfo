package com.example.parcinfo.repository;

import com.example.parcinfo.model.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {

    Optional<Material> findByNumeroInventaire(String numeroInventaire);

    Optional<Material> findByNumeroSerie(String numeroSerie);

    boolean existsByNumeroInventaire(String numeroInventaire);

    boolean existsByNumeroSerie(String numeroSerie);

    List<Material> findByTypeId(Long typeId);

    List<Material> findByEtat(Material.EtatMateriel etat);

    List<Material> findByBeneficiaireId(Long beneficiaireId);

    List<Material> findByMarqueId(Long marqueId);

    List<Material> findByPrixId(Long prixId);

    @Query("SELECT m FROM Material m WHERE " +
            "LOWER(COALESCE(m.numeroInventaire, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(COALESCE(m.numeroSerie, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.type.designation) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Material> searchByKeyword(@Param("keyword") String keyword);

    // ✅ NOUVELLE MÉTHODE : Récupérer les matériels par achatId
    @Query("SELECT m FROM Material m WHERE m.prix.achat.id = :achatId")
    List<Material> findByAchatId(@Param("achatId") Long achatId);


    long countByEtat(Material.EtatMateriel etat);

    long countByTypeId(Long typeId);

    //List<Material> findByAchatIdAndEtat(Long achatId, Material.EtatMateriel etat);

    /**
     * Trouver les matériels disponibles pour un achat spécifique
     * via la relation Material -> Prix -> Achat
     */
    @Query("SELECT m FROM Material m " +
            "JOIN m.prix p " +
            "WHERE p.achat.id = :achatId " +
            "AND m.etat = com.example.parcinfo.model.Material.EtatMateriel.DISPONIBLE")
    List<Material> findDisponiblesByAchatId(@Param("achatId") Long achatId);

//    /**
//     * Trouver tous les matériels (attribués ou non) pour un achat spécifique
//     */
//    @Query("SELECT m FROM Material m JOIN m.prix p WHERE p.achat.id = :achatId")
//    List<Material> findByAchatId(@Param("achatId") Long achatId);
    /**
     * ✅ Trouver les matériels disponibles pour un prix spécifique
     */
    List<Material> findByPrixIdAndEtat(Long prixId, Material.EtatMateriel etat);
    /**
     * ✅ Trouver les matériels attribués pour un achat et bénéficiaire spécifiques
     */
    @Query("SELECT m FROM Material m " +
            "JOIN m.prix p " +
            "WHERE p.achat.id = :achatId " +
            "AND m.beneficiaire.id = :beneficiaireId " +
            "AND m.etat = com.example.parcinfo.model.Material.EtatMateriel.ATTRIBUE")
    List<Material> findByAchatIdAndBeneficiaireIdAndEtat(
            @Param("achatId") Long achatId,
            @Param("beneficiaireId") Long beneficiaireId,
            Material.EtatMateriel etat
    );

    /**
     * ✅ Trouver tous les matériels attribués pour un achat
     */
    @Query("SELECT m FROM Material m " +
            "JOIN m.prix p " +
            "WHERE p.achat.id = :achatId " +
            "AND m.etat = com.example.parcinfo.model.Material.EtatMateriel.ATTRIBUE")
    List<Material> findByAchatIdAndEtat(
            @Param("achatId") Long achatId,
            Material.EtatMateriel etat
    );

}