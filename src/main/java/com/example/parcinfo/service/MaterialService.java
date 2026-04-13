package com.example.parcinfo.service;

import com.example.parcinfo.controller.MaterielsPreparationResponse;
import com.example.parcinfo.dto.*;
import com.example.parcinfo.exception.ValidationException;
import com.example.parcinfo.model.*;
import com.example.parcinfo.repository.*;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;

@Service
@RequiredArgsConstructor
public class MaterialService {

    @Autowired
    MaterialRepository materialRepository;
    @Autowired
    BeneficiaireRepository beneficiaireRepository;
    @Autowired
    HistoriqueAttributionService historiqueService;

    @Autowired
    private DemandeReaffectationRepository demandeReaffectationRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    PrixRepository prixRepository;
    @Transactional(readOnly = true)
    public List<Material> getAllMateriels() {
        return materialRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Material getMaterielById(Long id) {
        return materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Matériel non trouvé"));
    }

    /**
     * Attribuer un matériel à un bénéficiaire
     */
    @Transactional
    public Material attribuerMateriel(AttributionMaterialDTO dto) {
        Material materiel = materialRepository.findById(dto.getMaterielId())
                .orElseThrow(() -> new RuntimeException("Matériel non trouvé avec l'ID: " + dto.getMaterielId()));

        Beneficiaire beneficiaire = beneficiaireRepository.findById(dto.getBeneficiaireId())
                .orElseThrow(() -> new RuntimeException("Bénéficiaire non trouvé avec l'ID: " + dto.getBeneficiaireId()));

        if (materiel.getEtat() != Material.EtatMateriel.DISPONIBLE) {
            throw new RuntimeException("Le matériel n'est pas disponible pour attribution. État actuel: " + materiel.getEtat());
        }

        // Enregistrer dans l'historique AVANT la modification
        historiqueService.enregistrerAttribution(
                materiel.getId(),
                null, // pas d'ancien bénéficiaire
                beneficiaire.getId(),
                TypeOperation.ATTRIBUTION_INITIALE,
                "Attribution initiale du matériel " + materiel.getNumeroInventaire() + " à " +
                        beneficiaire.getNom() + " " + beneficiaire.getPrenom()
        );

        // Attribuer le matériel
        materiel.setBeneficiaire(beneficiaire);
        materiel.setEtat(Material.EtatMateriel.ATTRIBUE);
        materiel.setDateAttribution(dto.getDateAttribution() != null ?
                dto.getDateAttribution() : LocalDate.now());

        return materialRepository.save(materiel);
    }

    /**
     * Réaffecter un matériel à un autre bénéficiaire
     */
    /**
     * Réaffecter un matériel à un autre bénéficiaire
     */
    @Transactional
    public Material reaffecterMateriel(AttributionMaterialDTO dto) {
        System.out.println("=== DÉBUT RÉAFFECTATION ===");
        System.out.println("Matériel ID: " + dto.getMaterielId());
        System.out.println("Nouveau bénéficiaire ID: " + dto.getBeneficiaireId());

        Material materiel = materialRepository.findById(dto.getMaterielId())
                .orElseThrow(() -> new RuntimeException("Matériel non trouvé avec l'ID: " + dto.getMaterielId()));

        System.out.println("Matériel trouvé: " + materiel.getNumeroInventaire());
        System.out.println("Ancien bénéficiaire: " + (materiel.getBeneficiaire() != null ? materiel.getBeneficiaire().getNom() : "null"));
        System.out.println("État actuel: " + materiel.getEtat());

        Beneficiaire nouveauBeneficiaire = beneficiaireRepository.findById(dto.getBeneficiaireId())
                .orElseThrow(() -> new RuntimeException("Bénéficiaire non trouvé avec l'ID: " + dto.getBeneficiaireId()));

        if (materiel.getEtat() != Material.EtatMateriel.ATTRIBUE) {
            throw new RuntimeException("Le matériel doit être attribué pour pouvoir être réaffecté. État actuel: " + materiel.getEtat());
        }

        Long ancienBeneficiaireId = (materiel.getBeneficiaire() != null) ?
                materiel.getBeneficiaire().getId() : null;

        // Enregistrer dans l'historique
        historiqueService.enregistrerAttribution(
                materiel.getId(),
                ancienBeneficiaireId,
                nouveauBeneficiaire.getId(),
                TypeOperation.REAFFECTATION,
                "Réaffectation du matériel " + materiel.getNumeroInventaire() +
                        " de " + (materiel.getBeneficiaire() != null ? materiel.getBeneficiaire().getNom() : "inconnu") +
                        " vers " + nouveauBeneficiaire.getNom() + " " + nouveauBeneficiaire.getPrenom() +
                        (dto.getObservations() != null ? " - " + dto.getObservations() : "")
        );

        // Réaffecter le matériel
        materiel.setBeneficiaire(nouveauBeneficiaire);
        materiel.setDateAttribution(dto.getDateAttribution() != null ?
                dto.getDateAttribution() : LocalDate.now());

        Material saved = materialRepository.save(materiel);

        System.out.println("Nouveau bénéficiaire après sauvegarde: " + (saved.getBeneficiaire() != null ? saved.getBeneficiaire().getNom() : "null"));
        System.out.println("=== FIN RÉAFFECTATION ===");

        return saved;
    }
    /**
     * Libérer un matériel (retirer l'attribution)
     */
    @Transactional
    public Material libererMateriel(Long materielId) {
        Material materiel = materialRepository.findById(materielId)
                .orElseThrow(() -> new RuntimeException("Matériel non trouvé avec l'ID: " + materielId));

        if (materiel.getEtat() != Material.EtatMateriel.ATTRIBUE) {
            throw new RuntimeException("Le matériel n'est pas attribué. État actuel: " + materiel.getEtat());
        }

        Long ancienBeneficiaireId = (materiel.getBeneficiaire() != null) ?
                materiel.getBeneficiaire().getId() : null;

        // Enregistrer dans l'historique AVANT la modification
        historiqueService.enregistrerAttribution(
                materiel.getId(),
                ancienBeneficiaireId,
                null, // pas de nouveau bénéficiaire
                TypeOperation.LIBERATION,
                "Libération du matériel " + materiel.getNumeroInventaire() +
                        " par " + (materiel.getBeneficiaire() != null ? materiel.getBeneficiaire().getNom() : "inconnu")
        );

        // Libérer le matériel
        materiel.setBeneficiaire(null);
        materiel.setEtat(Material.EtatMateriel.DISPONIBLE);
        materiel.setDateAttribution(null);

        return materialRepository.save(materiel);
    }

    @Transactional(readOnly = true)
    public List<Material> getMaterielsAttribues() {
        return materialRepository.findByEtat(Material.EtatMateriel.ATTRIBUE);
    }

    @Transactional(readOnly = true)
    public List<Material> getMaterielsDisponibles() {
        return materialRepository.findByEtat(Material.EtatMateriel.DISPONIBLE);
    }

    @Transactional(readOnly = true)
    public List<Material> getMaterielsByBeneficiaire(Long beneficiaireId) {
        return materialRepository.findByBeneficiaireId(beneficiaireId);
    }


    /**
     * Attribuer une configuration complète de matériels (un matériel par prix d'un achat) à un bénéficiaire
     */
    @Transactional
    public List<Material> affecterConfigurationComplete(AffectationCompleteDTO dto) {
        if (dto.getAchatId() == null) {
            throw new RuntimeException("Achat ID non spécifié");
        }

        if (dto.getBeneficiaireId() == null) {
            throw new RuntimeException("Bénéficiaire non spécifié");
        }

        if (dto.getMaterielIds() == null || dto.getMaterielIds().isEmpty()) {
            throw new RuntimeException("Aucun matériel sélectionné pour l'attribution");
        }

        Beneficiaire beneficiaire = beneficiaireRepository.findById(dto.getBeneficiaireId())
                .orElseThrow(() -> new RuntimeException("Bénéficiaire non trouvé avec l'ID: " + dto.getBeneficiaireId()));

        List<Material> materielsAttribues = new ArrayList<>();

        for (Long materielId : dto.getMaterielIds()) {
            try {
                Material materiel = materialRepository.findById(materielId)
                        .orElseThrow(() -> new RuntimeException("Matériel non trouvé avec l'ID: " + materielId));

                if (materiel.getEtat() != Material.EtatMateriel.DISPONIBLE) {
                    throw new RuntimeException("Le matériel " + getNumeroInventaireOrId(materiel) +
                            " n'est pas disponible. État actuel: " + materiel.getEtat());
                }

                // ✅ CORRECTION : Naviguer via la relation Material -> Prix -> Achat
                if (materiel.getPrix() == null ||
                        materiel.getPrix().getAchat() == null ||
                        !materiel.getPrix().getAchat().getId().equals(dto.getAchatId())) {
                    throw new RuntimeException("Le matériel " + getNumeroInventaireOrId(materiel) +
                            " n'appartient pas à l'achat spécifié");
                }

                // Enregistrer dans l'historique
                historiqueService.enregistrerAttribution(
                        materiel.getId(),
                        null, // pas d'ancien bénéficiaire
                        beneficiaire.getId(),
                        TypeOperation.ATTRIBUTION_INITIALE,
                        "Attribution complète: " + getNumeroInventaireOrId(materiel) +
                                " à " + beneficiaire.getNom() + " " + beneficiaire.getPrenom() +
                                (dto.getObservations() != null ? " - " + dto.getObservations() : "")
                );

                // Attribuer le matériel
                materiel.setBeneficiaire(beneficiaire);
                materiel.setEtat(Material.EtatMateriel.ATTRIBUE);
                materiel.setDateAttribution(dto.getDateAttribution() != null ?
                        dto.getDateAttribution() : LocalDate.now());

                materialRepository.save(materiel);
                materielsAttribues.add(materiel);

            } catch (Exception e) {
                System.err.println("Erreur lors de l'attribution du matériel " + materielId + ": " + e.getMessage());
                throw e; // Arrêter en cas d'erreur pour garantir l'intégrité
            }
        }

        if (materielsAttribues.isEmpty()) {
            throw new RuntimeException("Aucun matériel n'a pu être attribué");
        }

        return materielsAttribues;
    }

    /**
     * Obtenir les matériels disponibles groupés par prix/designation pour un achat donné
     */
    @Transactional(readOnly = true)
    public Map<String, List<Material>> getMaterielsDisponiblesParPrix(Long achatId) {
        List<Material> materiels = materialRepository.findDisponiblesByAchatId(achatId);

        // Grouper par designation du prix (ex: "MICRO-ORDINATEUR", "ÉCRAN", etc.)
        return materiels.stream()
                .collect(Collectors.groupingBy(
                        materiel -> {
                            if (materiel.getPrix() != null && materiel.getPrix().getDesignation() != null) {
                                return materiel.getPrix().getDesignation();
                            }
                            return "Autre";
                        },
                        LinkedHashMap::new, // Préserver l'ordre d'insertion
                        Collectors.toList()
                ));
    }

    // Méthode utilitaire pour afficher le numéro d'inventaire ou l'ID
    private String getNumeroInventaireOrId(Material materiel) {
        return materiel.getNumeroInventaire() != null
                ? materiel.getNumeroInventaire()
                : "Matériel #" + materiel.getId();
    }

    public List<Material> getMaterielsDisponiblesParPrixId(Long prixId) {
        return materialRepository.findByPrixIdAndEtat(prixId, Material.EtatMateriel.DISPONIBLE);
    }

    public List<Material> getMaterielsAttribuesParAchatEtBeneficiaire(Long achatId, Long beneficiaireId) {
        return materialRepository.findByAchatIdAndBeneficiaireIdAndEtat(
                achatId,
                beneficiaireId,
                Material.EtatMateriel.ATTRIBUE
        );
    }

    public Map<Beneficiaire, List<Material>> getPriseEnChargeByAchat(Long achatId) {
        List<Material> materiels = materialRepository.findByAchatIdAndEtat(
                achatId,
                Material.EtatMateriel.ATTRIBUE
        );

        // Grouper par bénéficiaire
        return materiels.stream()
                .filter(m -> m.getBeneficiaire() != null)
                .collect(Collectors.groupingBy(Material::getBeneficiaire));
    }

    /**
     * Préparer les matériels pour un prix donné
     */
    @Transactional
    public List<Material> preparerMateriels(Long prixId, List<MaterielPreparationDTO> preparationData) {

        Prix prix = prixRepository.findById(prixId)
                .orElseThrow(() -> new RuntimeException("Prix non trouvé: " + prixId));

        List<Material> materielsExistants = materialRepository.findByPrixIdOrdered(prixId);

        // Map pour lookup rapide par ID
        Map<Long, Material> byId = materielsExistants.stream()
                .collect(Collectors.toMap(Material::getId, m -> m));

        List<Material> result = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        // 🔥 Track des séries pour détecter les doublons DANS le batch
        Set<String> seriesDansBatch = new HashSet<>();
        Set<String> ecransDansBatch = new HashSet<>();

        for (int i = 0; i < preparationData.size(); i++) {
            MaterielPreparationDTO dto = preparationData.get(i);
            int ligne = i + 1;

            // 🔥 Validation 1: N° Série Matériel requis
            if (dto.getNumeroSerie() == null || dto.getNumeroSerie().isBlank()) {
                errors.add("Ligne " + ligne + ": N° Série Matériel requis");
                continue;
            }

            // 🔥 Validation 2: Trouver le matériel par ID (plus fiable que l'index)
            Material materiel = byId.get(dto.getMaterialId());
            if (materiel == null) {
                errors.add("Ligne " + ligne + ": Matériel non trouvé (ID: " + dto.getMaterialId() + ")");
                continue;
            }

            String newSerie = dto.getNumeroSerie().trim().toUpperCase();

            // 🔥 Validation 3: Doublon dans le batch d'import
            if (seriesDansBatch.contains(newSerie)) {
                errors.add("Ligne " + ligne + ": Série '" + newSerie + "' en doublon dans ce lot");
                continue;
            }

            // 🔥 Validation 4: Doublon en base (hors ce matériel)
            if (materialRepository.existsByNumeroSerieAndIdNot(newSerie, materiel.getId())) {
                errors.add("Ligne " + ligne + ": Série '" + newSerie + "' déjà utilisée en base");
                continue;
            }

            seriesDansBatch.add(newSerie);
            materiel.setNumeroSerie(newSerie);

            // 🔥 Validation Écran (optionnel mais avec mêmes règles)
            if (dto.getNumeroSerieEcran() != null && !dto.getNumeroSerieEcran().isBlank()) {
                String newEcran = dto.getNumeroSerieEcran().trim().toUpperCase();

                if (ecransDansBatch.contains(newEcran)) {
                    errors.add("Ligne " + ligne + ": Série écran '" + newEcran + "' en doublon dans ce lot");
                    continue;
                }

                if (materialRepository.existsByNumeroSerieEcranAndIdNot(newEcran, materiel.getId())) {
                    errors.add("Ligne " + ligne + ": Série écran '" + newEcran + "' déjà utilisée en base");
                    continue;
                }

                ecransDansBatch.add(newEcran);
                materiel.setNumeroSerieEcran(newEcran);
            }

            if (dto.getObservations() != null) {
                materiel.setObservations(dto.getObservations());
            }

            result.add(materialRepository.save(materiel));
        }

        if (!errors.isEmpty()) {
            // 🔥 Retourner les erreurs de façon structurée pour le frontend
            throw new ValidationException("Erreurs de validation", errors);
        }

        return result;
    }
    /**
     * Récupérer les matériels par ID de prix
     */
    public List<Material> getMaterielsByPrix(Long prixId) {
        return materialRepository.findByPrixId(prixId);
    }


    public List<Material> getMaterielsSansInventaireByPrix(Long prixId) {
        return materialRepository.findByPrixIdWithoutInventaire(prixId);
    }

    /**
     * Met à jour les numéros d'inventaire pour des matériels d'un prix
     * Basé sur le numéro de série comme clé d'identification
     */
    @Transactional
    public InventaireUpdateResult updateNumerosInventaire(Long prixId,
                                                          List<MaterielInventaireDTO> updates) {
        List<String> warnings = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        int updatedCount = 0;
        int skippedCount = 0;

        // Indexer les matériels existants par numéro de série pour lookup rapide
        Map<String, Material> materielsBySerie = materialRepository
                .findByPrixIdWithoutInventaire(prixId)
                .stream()
                .filter(m -> m.getNumeroSerie() != null)
                .collect(Collectors.toMap(
                        Material::getNumeroSerie,
                        m -> m,
                        (existing, replacement) -> existing
                ));

        for (MaterielInventaireDTO dto : updates) {
            if (!dto.isValid()) {
                errors.add("Données invalides pour série: " + dto.getNumeroSerie());
                skippedCount++;
                continue;
            }

            String serie = dto.getNumeroSerie().trim();
            String inventaire = dto.getNumeroInventaire().trim().toUpperCase();

            // 1. Trouver le matériel par série
            Material materiel = materielsBySerie.get(serie);
            if (materiel == null) {
                warnings.add("Matériel non trouvé pour N° Série: " + serie);
                skippedCount++;
                continue;
            }

            // 2. Vérifier unicité du numéro d'inventaire (global)
            if (materialRepository.existsByNumeroInventaireAndIdNot(inventaire, materiel.getId())) {
                errors.add("N° Inventaire '" + inventaire + "' déjà utilisé (série: " + serie + ")");
                skippedCount++;
                continue;
            }

            // 3. Mettre à jour
            materiel.setNumeroInventaire(inventaire);
//            materiel.setDateInventaire(new Date()); // Optionnel : timestamp de l'attribution
            materialRepository.save(materiel);
            updatedCount++;

            // Retirer de la map pour éviter doublons dans le même batch
            materielsBySerie.remove(serie);
        }

        return new InventaireUpdateResult(updatedCount, skippedCount, warnings, errors);
    }

    /**
     * Prépare les données pour l'export Excel du template d'inventaire
     */
    public List<Map<String, Object>> getTemplateDataForAchat(Long achatId) {
        List<Material> materiels = materialRepository.findByAchatIdWithSerial(achatId);

        return materiels.stream().map(m -> {
            Map<String, Object> row = new LinkedHashMap<>(); // Ordre préservé
            row.put("N° Série Matériel", m.getNumeroSerie());
            row.put("Nature", m.getPrix() != null ? m.getPrix().getNature() : "");
            row.put("Désignation", m.getPrix() != null ? m.getPrix().getDesignation() : "");
            row.put("Bénéficiaire Actuel",
                    m.getBeneficiaire() != null ?
                            m.getBeneficiaire().getNom() + " " + m.getBeneficiaire().getPrenom() :
                            "Non attribué");
            row.put("N° d'Inventaire", m.getNumeroInventaire() != null ? m.getNumeroInventaire() : "");
            row.put("N° Prix", m.getPrix() != null ? m.getPrix().getNumeroPrix() : "");
            return row;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MaterielsPreparationResponse getMaterielsPreparationByPrix(Long prixId) {

        List<Material> aPreparer = materialRepository
                .findByPrixIdWithSerialWithoutInventaire(prixId);

        List<Material> dejaAttribues = materialRepository
                .findByPrixIdWithSerialAndInventaire(prixId);

        List<Material> enAttenteSerie = materialRepository
                .findByPrixIdWithoutSerial(prixId);

        long totalWithSerial = materialRepository.countByPrixIdWithSerial(prixId);
        long totalPrepared = materialRepository.countByPrixIdPrepared(prixId);

        return new MaterielsPreparationResponse(
                aPreparer,
                dejaAttribues,
                enAttenteSerie,
                totalWithSerial,
                totalPrepared
        );
    }

    @Transactional(readOnly = true)
    public List<Material> getMaterielsByAchatAndBeneficiaireWithSerial(Long achatId, Long beneficiaireId) {
        return materialRepository.findByAchatIdAndBeneficiaireIdWithSerial(achatId, beneficiaireId);
    }

    @Transactional
    public InventaireUpdateResult updateNumerosInventaireBatch(
            Long achatId,
            Long beneficiaireId,
            List<MaterielInventaireDTO> updates) {

        List<String> errors = new ArrayList<>();
        int updatedCount = 0;

        for (MaterielInventaireDTO dto : updates) {
            if (dto.getNumeroSerie() == null || dto.getNumeroInventaire() == null) continue;

            // Trouver le matériel par achat + bénéficiaire + série
            Optional<Material> optional = materialRepository
                    .findByAchatIdAndBeneficiaireIdWithSerial(achatId, beneficiaireId)
                    .stream()
                    .filter(m -> dto.getNumeroSerie().equals(m.getNumeroSerie()))
                    .findFirst();

            if (optional.isEmpty()) {
                errors.add("Matériel non trouvé pour série: " + dto.getNumeroSerie());
                continue;
            }

            Material materiel = optional.get();
            String nouvelInventaire = dto.getNumeroInventaire().trim().toUpperCase();

            // Vérifier unicité (sauf si c'est le même matériel)
            if (materialRepository.existsByNumeroInventaireAndIdNot(nouvelInventaire, materiel.getId())) {
                errors.add("N° Inventaire '" + nouvelInventaire + "' déjà utilisé");
                continue;
            }

            materiel.setNumeroInventaire(nouvelInventaire);
           // materiel.setDateInventaire(new Date()); // Optionnel
            materialRepository.save(materiel);
            updatedCount++;
        }

        return new InventaireUpdateResult(updatedCount, updates.size() - updatedCount, List.of(), errors);
    }


    /**
     * Créer une demande de réaffectation avec validation à deux niveaux
     */
    @Transactional
    public DemandeReaffectation creerDemandeReaffectation(
            AttributionMaterialDTO dto,
            Long demandeurId,
            Long validateurId) {

        Material materiel = materialRepository.findById(dto.getMaterielId())
                .orElseThrow(() -> new RuntimeException("Matériel non trouvé"));

        Beneficiaire source = materiel.getBeneficiaire();
        if (source == null) {
            throw new RuntimeException("Le matériel n'est pas attribué");
        }

        Beneficiaire destination = beneficiaireRepository.findById(dto.getBeneficiaireId())
                .orElseThrow(() -> new RuntimeException("Bénéficiaire destination non trouvé"));

        Utilisateur demandeur = utilisateurRepository.findById(demandeurId)
                .orElseThrow(() -> new RuntimeException("Demandeur non trouvé"));

        Utilisateur validateur = utilisateurRepository.findById(validateurId)
                .orElseThrow(() -> new RuntimeException("Validateur non trouvé"));

        DemandeReaffectation demande = DemandeReaffectation.builder()
                .materiel(materiel)
                .beneficiaireSource(source)
                .beneficiaireDestination(destination)
                .demandeur(demandeur)
                .validateur(validateur)
                .statut(DemandeReaffectation.StatutDemande.EN_ATTENTE)  // ✅ Toujours EN_ATTENTE
                .dateDemande(LocalDateTime.now())
                .observations(dto.getObservations())
                .build();

        System.out.println("=== CRÉATION DEMANDE ===");
        System.out.println("Demandeur: " + demandeur.getNom() + " (" + demandeur.getRole() + ")");
        System.out.println("Validateur: " + validateur.getNom() + " (" + validateur.getRole() + ")");
        System.out.println("Statut: EN_ATTENTE");

        return demandeReaffectationRepository.save(demande);
    }
    /**
     * Valider une demande de réaffectation (1ère ou 2ème étape)
     */
    /**
     * Valider une demande de réaffectation (1ère ou 2ème étape)
     */
    /**
     * Valider une demande de réaffectation (1ère ou 2ème étape)
     */
    /**
     * Valider une demande de réaffectation (1ère ou 2ème étape)
     */
    /**
     * Valider une demande de réaffectation (validation unique)
     */
    @Transactional
    public DemandeReaffectation validerDemande(Long demandeId, Long validateurId, boolean accepte, String motifRejet) {
        DemandeReaffectation demande = demandeReaffectationRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        Utilisateur validateur = utilisateurRepository.findById(validateurId)
                .orElseThrow(() -> new RuntimeException("Validateur non trouvé"));

        System.out.println("=== VALIDATION DEMANDE ===");
        System.out.println("Demande ID: " + demandeId);
        System.out.println("Validateur ID: " + validateurId);
        System.out.println("Validateur rôle: " + validateur.getRole());
        System.out.println("Demandeur rôle: " + demande.getDemandeur().getRole());
        System.out.println("Statut actuel: " + demande.getStatut());
        System.out.println("Accepte: " + accepte);

        // Vérifier que le validateur est bien celui attendu
        if (!demande.getValidateur().getId().equals(validateurId)) {
            throw new RuntimeException("Vous n'êtes pas le validateur désigné pour cette demande");
        }

        // EMPÊCHER L'AUTO-VALIDATION
        if (demande.getDemandeur().getId().equals(validateurId)) {
            throw new RuntimeException("Vous ne pouvez pas valider votre propre demande");
        }

        if (!accepte) {
            demande.setStatut(DemandeReaffectation.StatutDemande.REJETEE);
            demande.setMotifRejet(motifRejet);
            demande.setDateValidation(LocalDateTime.now());
            System.out.println("Demande refusée");
            return demandeReaffectationRepository.save(demande);
        }

        // ✅ VALIDATION ACCEPTÉE - Récupérer la liste des matériels
        List<Material> materielsAAffecter = new ArrayList<>();

        // Cas 1: Demande groupée (avec la liste materiels)
        if (demande.getMateriels() != null && !demande.getMateriels().isEmpty()) {
            materielsAAffecter = demande.getMateriels();
            System.out.println("Demande groupée - Nombre de matériels: " + materielsAAffecter.size());
        }
        // Cas 2: Demande simple (avec l'ancien champ materiel)
        else if (demande.getMateriel() != null) {
            materielsAAffecter.add(demande.getMateriel());
            System.out.println("Demande simple - 1 matériel");
        }
        else {
            throw new RuntimeException("Aucun matériel trouvé dans la demande");
        }

        // Exécuter la réaffectation pour TOUS les matériels
        for (Material materiel : materielsAAffecter) {
            System.out.println("Réaffectation du matériel: " + materiel.getNumeroInventaire());

            // Vérifier que le matériel est bien attribué
            if (materiel.getBeneficiaire() == null) {
                throw new RuntimeException("Le matériel " + materiel.getNumeroInventaire() + " n'est pas attribué");
            }

            AttributionMaterialDTO dto = AttributionMaterialDTO.builder()
                    .materielId(materiel.getId())
                    .beneficiaireId(demande.getBeneficiaireDestination().getId())
                    .dateAttribution(LocalDate.now())
                    .observations(demande.getObservations())
                    .build();

            reaffecterMateriel(dto);
            System.out.println("Matériel réaffecté avec succès: " + materiel.getNumeroInventaire());
        }

        demande.setStatut(DemandeReaffectation.StatutDemande.VALIDEE);
        demande.setDateValidation(LocalDateTime.now());

        System.out.println("=== VALIDATION TERMINÉE ===");
        return demandeReaffectationRepository.save(demande);
    }

    /**
     * Obtenir les demandes en attente pour un validateur
     */
    /**
     * Obtenir les demandes en attente pour un validateur
     */
    /**
     * Obtenir les demandes en attente pour un validateur
     */
    public List<DemandeReaffectation> getDemandesEnAttentePourValidateur(Long validateurId) {
        try {
            Utilisateur validateur = utilisateurRepository.findById(validateurId)
                    .orElseThrow(() -> new RuntimeException("Validateur non trouvé: " + validateurId));

            System.out.println("=== getDemandesEnAttentePourValidateur ===");
            System.out.println("Validateur ID: " + validateurId);
            System.out.println("Validateur rôle: " + validateur.getRole());

            List<DemandeReaffectation> result = new ArrayList<>();

            if ("ADMIN".equals(validateur.getRole())) {
                // ADMIN peut valider les demandes créées par USER (EN_ATTENTE)
                result = demandeReaffectationRepository.findByStatutAndValidateurId(
                        DemandeReaffectation.StatutDemande.EN_ATTENTE, validateurId);
                System.out.println("ADMIN - Demandes EN_ATTENTE trouvées: " + result.size());
            } else if ("USER".equals(validateur.getRole())) {
                // USER peut valider les demandes créées par ADMIN (EN_ATTENTE)
                result = demandeReaffectationRepository.findByStatutAndValidateurId(
                        DemandeReaffectation.StatutDemande.EN_ATTENTE, validateurId);
                System.out.println("USER - Demandes EN_ATTENTE trouvées: " + result.size());
            }

            return result;
        } catch (Exception e) {
            System.err.println("Erreur dans getDemandesEnAttentePourValidateur: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
    /**
     * Récupérer toutes les demandes où l'utilisateur est demandeur OU validateur
     */
    @Transactional(readOnly = true)
    public List<DemandeReaffectation> getDemandesByUser(Long userId) {
        // ✅ CORRECTION : Un seul paramètre (userId)
        return demandeReaffectationRepository.findByDemandeurIdOrValidateurId(userId);
    }
// Dans MaterialService.java - Ajouter ces méthodes

    /**
     * Créer une demande groupée de réaffectation
     */
    @Transactional
    public DemandeReaffectation creerDemandeReaffectationGroupee(
            DemandeReaffectationGroupeeDTO dto) {

        // Vérifier que tous les matériels existent et appartiennent au même bénéficiaire source
        List<Material> materiels = new ArrayList<>();
        Beneficiaire beneficiaireSource = null;

        for (Long materielId : dto.getMaterielIds()) {
            Material materiel = materialRepository.findById(materielId)
                    .orElseThrow(() -> new RuntimeException("Matériel non trouvé: " + materielId));

            if (materiel.getBeneficiaire() == null) {
                throw new RuntimeException("Le matériel " + materiel.getNumeroInventaire() + " n'est pas attribué");
            }

            if (beneficiaireSource == null) {
                beneficiaireSource = materiel.getBeneficiaire();
            } else if (!beneficiaireSource.getId().equals(materiel.getBeneficiaire().getId())) {
                throw new RuntimeException("Tous les matériels doivent appartenir au même bénéficiaire source");
            }

            materiels.add(materiel);
        }

        if (materiels.isEmpty()) {
            throw new RuntimeException("Aucun matériel sélectionné");
        }

        Beneficiaire destination = beneficiaireRepository.findById(dto.getBeneficiaireDestinationId())
                .orElseThrow(() -> new RuntimeException("Bénéficiaire destination non trouvé"));

        Utilisateur demandeur = utilisateurRepository.findById(dto.getDemandeurId())
                .orElseThrow(() -> new RuntimeException("Demandeur non trouvé"));

        Utilisateur validateur = utilisateurRepository.findById(dto.getValidateurId())
                .orElseThrow(() -> new RuntimeException("Validateur non trouvé"));

        DemandeReaffectation demande = DemandeReaffectation.builder()
                .materiels(materiels)
                .beneficiaireSource(beneficiaireSource)
                .beneficiaireDestination(destination)
                .demandeur(demandeur)
                .validateur(validateur)
                .statut(DemandeReaffectation.StatutDemande.EN_ATTENTE)
                .dateDemande(LocalDateTime.now())
                .observations(dto.getObservations())
                .build();

        return demandeReaffectationRepository.save(demande);
    }

    /**
     * Valider une demande groupée
     */
    @Transactional
    public DemandeReaffectation validerDemandeGroupee(Long demandeId, Long validateurId, boolean accepte, String motifRejet) {
        DemandeReaffectation demande = demandeReaffectationRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        Utilisateur validateur = utilisateurRepository.findById(validateurId)
                .orElseThrow(() -> new RuntimeException("Validateur non trouvé"));

        if (!demande.getValidateur().getId().equals(validateurId)) {
            throw new RuntimeException("Vous n'êtes pas le validateur désigné pour cette demande");
        }

        if (demande.getDemandeur().getId().equals(validateurId)) {
            throw new RuntimeException("Vous ne pouvez pas valider votre propre demande");
        }

        if (!accepte) {
            demande.setStatut(DemandeReaffectation.StatutDemande.REJETEE);
            demande.setMotifRejet(motifRejet);
            demande.setDateValidation(LocalDateTime.now());
            return demandeReaffectationRepository.save(demande);
        }

        // Valider et réaffecter TOUS les matériels de la demande
        for (Material materiel : demande.getMateriels()) {
            AttributionMaterialDTO dto = AttributionMaterialDTO.builder()
                    .materielId(materiel.getId())
                    .beneficiaireId(demande.getBeneficiaireDestination().getId())
                    .dateAttribution(LocalDate.now())
                    .observations(demande.getObservations())
                    .build();
            reaffecterMateriel(dto);
        }

        demande.setStatut(DemandeReaffectation.StatutDemande.VALIDEE);
        demande.setDateValidation(LocalDateTime.now());

        return demandeReaffectationRepository.save(demande);
    }
}