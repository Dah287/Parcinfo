package com.example.parcinfo.service;

import com.example.parcinfo.controller.MaterielsPreparationResponse;
import com.example.parcinfo.dto.*;
import com.example.parcinfo.model.Material;
import com.example.parcinfo.model.Beneficiaire;
import com.example.parcinfo.model.Prix;
import com.example.parcinfo.model.TypeOperation;
import com.example.parcinfo.repository.MaterialRepository;
import com.example.parcinfo.repository.BeneficiaireRepository;
import com.example.parcinfo.repository.PrixRepository;
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
    @Transactional
    public Material reaffecterMateriel(AttributionMaterialDTO dto) {
        Material materiel = materialRepository.findById(dto.getMaterielId())
                .orElseThrow(() -> new RuntimeException("Matériel non trouvé avec l'ID: " + dto.getMaterielId()));

        Beneficiaire nouveauBeneficiaire = beneficiaireRepository.findById(dto.getBeneficiaireId())
                .orElseThrow(() -> new RuntimeException("Bénéficiaire non trouvé avec l'ID: " + dto.getBeneficiaireId()));

        if (materiel.getEtat() != Material.EtatMateriel.ATTRIBUE) {
            throw new RuntimeException("Le matériel doit être attribué pour pouvoir être réaffecté. État actuel: " + materiel.getEtat());
        }

        Long ancienBeneficiaireId = (materiel.getBeneficiaire() != null) ?
                materiel.getBeneficiaire().getId() : null;

        // Enregistrer dans l'historique AVANT la modification
        historiqueService.enregistrerAttribution(
                materiel.getId(),
                ancienBeneficiaireId,
                nouveauBeneficiaire.getId(),
                TypeOperation.REAFFECTATION,
                "Réaffectation du matériel " + materiel.getNumeroInventaire() +
                        " de " + (materiel.getBeneficiaire() != null ? materiel.getBeneficiaire().getNom() : "inconnu") +
                        " vers " + nouveauBeneficiaire.getNom() + " " + nouveauBeneficiaire.getPrenom()
        );

        // Réaffecter le matériel
        materiel.setBeneficiaire(nouveauBeneficiaire);
        materiel.setDateAttribution(dto.getDateAttribution() != null ?
                dto.getDateAttribution() : LocalDate.now());

        return materialRepository.save(materiel);
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

        // 🔁 Permettre les mises à jour partielles : ne pas vérifier la quantité exacte
        // if (preparationData.size() != prix.getQuantite()) { ... } // ← SUPPRIMÉ

        List<Material> materielsExistants = materialRepository.findByPrixIdOrdered(prixId);

        // Map pour lookup rapide par index ou par série existante
        Map<Integer, Material> byIndex = new HashMap<>();
        Map<String, Material> bySerie = new HashMap<>();

        for (int i = 0; i < materielsExistants.size(); i++) {
            Material m = materielsExistants.get(i);
            byIndex.put(i, m);
            if (m.getNumeroSerie() != null) {
                bySerie.put(m.getNumeroSerie(), m);
            }
        }

        List<Material> result = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (int i = 0; i < preparationData.size(); i++) {
            MaterielPreparationDTO dto = preparationData.get(i);

            if (dto.getNumeroSerie() == null || dto.getNumeroSerie().isBlank()) {
                errors.add("Ligne " + (i+1) + ": N° Série Matériel requis");
                continue;
            }

            // 🔍 Trouver le matériel : par index d'abord, puis par série existante
            Material materiel = byIndex.get(i);
            if (materiel == null) {
                materiel = bySerie.get(dto.getNumeroSerie());
            }
            if (materiel == null) {
                errors.add("Ligne " + (i+1) + ": Matériel non trouvé pour série: " + dto.getNumeroSerie());
                continue;
            }

            // ✅ Valider et mettre à jour N° Série Matériel
            String newSerie = dto.getNumeroSerie().trim().toUpperCase();
            if (!newSerie.equals(materiel.getNumeroSerie())) {
                if (materialRepository.existsByNumeroSerieAndIdNot(newSerie, materiel.getId())) {
                    errors.add("N° Série '" + newSerie + "' déjà utilisé (ligne " + (i+1) + ")");
                    continue;
                }
                materiel.setNumeroSerie(newSerie);
            }

            // ✅ Valider et mettre à jour N° Série Écran (optionnel)
            if (dto.getNumeroSerieEcran() != null && !dto.getNumeroSerieEcran().isBlank()) {
                String newEcran = dto.getNumeroSerieEcran().trim().toUpperCase();
                if (!newEcran.equals(materiel.getNumeroSerieEcran())) {
                    if (materialRepository.existsByNumeroSerieEcranAndIdNot(newEcran, materiel.getId())) {
                        errors.add("N° Série Écran '" + newEcran + "' déjà utilisé (ligne " + (i+1) + ")");
                        continue;
                    }
                    materiel.setNumeroSerieEcran(newEcran);
                }
            }

            // ✅ Observations
            if (dto.getObservations() != null) {
                materiel.setObservations(dto.getObservations());
            }

          //  materiel.setDatePreparation(new Date()); // Optionnel : timestamp
            result.add(materialRepository.save(materiel));
        }

        if (!errors.isEmpty()) {
            throw new RuntimeException("Erreurs de validation: " + String.join("; ", errors));
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

}