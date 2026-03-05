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
    Optional<Material> findByNumeroSerieEcran(String numeroSerieEcran); // NOUVEAU
    boolean existsByNumeroSerieEcran(String numeroSerieEcran); // NOUVEAU


    // Matériels d'un prix SANS numéro d'inventaire (à préparer)
    @Query("SELECT m FROM Material m WHERE m.prix.id = :prixId " +
            "AND (m.numeroInventaire IS NULL OR m.numeroInventaire = '') " +
            "AND m.numeroSerie IS NOT NULL AND m.numeroSerie != ''")
    List<Material> findByPrixIdWithoutInventaire(@Param("prixId") Long prixId);



    // Trouver un matériel par prix + numéro de série
    Optional<Material> findByPrixIdAndNumeroSerie(@Param("prixId") Long prixId,
                                                  @Param("numeroSerie") String numeroSerie);

    // Export : tous les matériels d'un achat avec leurs infos
    @Query("SELECT m FROM Material m " +
            "JOIN m.prix p " +
            "JOIN p.achat a " +
            "WHERE a.id = :achatId " +
            "AND m.numeroSerie IS NOT NULL AND m.numeroSerie != '' " +
            "ORDER BY p.numeroPrix, m.numeroSerie")
    List<Material> findByAchatIdWithSerial(@Param("achatId") Long achatId);


    // 1. Avec série, SANS inventaire (à préparer)
    @Query("SELECT m FROM Material m WHERE m.prix.id = :prixId " +
            "AND m.numeroSerie IS NOT NULL AND m.numeroSerie != '' " +
            "AND (m.numeroInventaire IS NULL OR m.numeroInventaire = '')")
    List<Material> findByPrixIdWithSerialWithoutInventaire(@Param("prixId") Long prixId);

    // 2. Avec série ET inventaire (déjà attribués - modifiables)
    @Query("SELECT m FROM Material m WHERE m.prix.id = :prixId " +
            "AND m.numeroSerie IS NOT NULL AND m.numeroSerie != '' " +
            "AND m.numeroInventaire IS NOT NULL AND m.numeroInventaire != ''")
    List<Material> findByPrixIdWithSerialAndInventaire(@Param("prixId") Long prixId);

    // 3. Sans série (bloqués)
    @Query("SELECT m FROM Material m WHERE m.prix.id = :prixId " +
            "AND (m.numeroSerie IS NULL OR m.numeroSerie = '')")
    List<Material> findByPrixIdWithoutSerial(@Param("prixId") Long prixId);

    // Comptages pour les stats
    @Query("SELECT COUNT(m) FROM Material m WHERE m.prix.id = :prixId " +
            "AND m.numeroSerie IS NOT NULL AND m.numeroSerie != ''")
    long countByPrixIdWithSerial(@Param("prixId") Long prixId);

    @Query("SELECT COUNT(m) FROM Material m WHERE m.prix.id = :prixId " +
            "AND m.numeroSerie IS NOT NULL AND m.numeroSerie != '' " +
            "AND m.numeroInventaire IS NOT NULL AND m.numeroInventaire != ''")
    long countByPrixIdPrepared(@Param("prixId") Long prixId);


    // Matériels d'un achat + bénéficiaire, AYANT un numéro de série (obligatoire)
    @Query("SELECT m FROM Material m " +
            "JOIN m.prix p " +
            "JOIN p.achat a " +
            "LEFT JOIN m.beneficiaire b " +
            "WHERE a.id = :achatId " +
            "AND (b.id = :beneficiaireId OR (b.id IS NULL AND :beneficiaireId IS NULL)) " +
            "AND m.numeroSerie IS NOT NULL AND m.numeroSerie != '' " +
            "ORDER BY m.numeroSerie")
    List<Material> findByAchatIdAndBeneficiaireIdWithSerial(
            @Param("achatId") Long achatId,
            @Param("beneficiaireId") Long beneficiaireId);

    // Vérifier unicité du N° Inventaire (pour validation)
    boolean existsByNumeroInventaireAndIdNot(String numeroInventaire, Long excludeId);



    // Vérifier unicité de N° Série (hors matériel actuel pour modification)
    boolean existsByNumeroSerieAndIdNot(String numeroSerie, Long excludeId);

    // Vérifier unicité de N° Série Écran (hors matériel actuel)
    boolean existsByNumeroSerieEcranAndIdNot(String numeroSerieEcran, Long excludeId);

    // Récupérer tous les matériels d'un prix (pour préparation)
    @Query("SELECT m FROM Material m WHERE m.prix.id = :prixId ORDER BY m.id")
    List<Material> findByPrixIdOrdered(@Param("prixId") Long prixId);
}