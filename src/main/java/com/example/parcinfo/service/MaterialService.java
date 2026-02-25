package com.example.parcinfo.service;

import com.example.parcinfo.dto.AffectationCompleteDTO;
import com.example.parcinfo.dto.AttributionMaterialDTO;
import com.example.parcinfo.dto.MaterielPreparationDTO;
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
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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

        // Récupérer le prix
        Prix prix = prixRepository.findById(prixId)
                .orElseThrow(() -> new RuntimeException("Prix non trouvé avec l'ID: " + prixId));

        // Vérifier que le nombre de matériels correspond à la quantité du prix
        if (preparationData.size() != prix.getQuantite()) {
            throw new RuntimeException(
                    String.format("Le nombre de matériels (%d) ne correspond pas à la quantité du prix (%d)",
                            preparationData.size(), prix.getQuantite())
            );
        }

        List<Material> materielsPrepares = new ArrayList<>();

        // Récupérer les matériels existants pour ce prix
        List<Material> materielsExistants = materialRepository.findByPrixId(prixId);

        // Vérifier qu'il y a assez de matériels disponibles
        if (materielsExistants.size() < preparationData.size()) {
            // Si pas assez, on peut en créer automatiquement via MaterialGenerationService
            // Ou on lance une erreur selon votre logique métier
            throw new RuntimeException(
                    String.format("Pas assez de matériels disponibles. Existants: %d, Demandés: %d",
                            materielsExistants.size(), preparationData.size())
            );
        }

        // Parcourir les données de préparation et mettre à jour les matériels
        for (int i = 0; i < preparationData.size(); i++) {
            MaterielPreparationDTO dto = preparationData.get(i);

            // Récupérer le matériel correspondant (soit par index, soit par logique métier)
            // Ici on suppose qu'on utilise les matériels dans l'ordre
            Material materiel = materielsExistants.get(i);

            // Vérifier l'unicité du numéro de série si fourni
            if (dto.getNumeroSerie() != null && !dto.getNumeroSerie().isEmpty()) {
                if (materialRepository.existsByNumeroSerie(dto.getNumeroSerie())) {
                    throw new RuntimeException(
                            "Le numéro de série '" + dto.getNumeroSerie() + "' est déjà utilisé"
                    );
                }
                materiel.setNumeroSerie(dto.getNumeroSerie());
            }

            // Vérifier l'unicité du numéro d'inventaire si fourni
            if (dto.getNumeroInventaire() != null && !dto.getNumeroInventaire().isEmpty()) {
                if (materialRepository.existsByNumeroInventaire(dto.getNumeroInventaire())) {
                    throw new RuntimeException(
                            "Le numéro d'inventaire '" + dto.getNumeroInventaire() + "' est déjà utilisé"
                    );
                }
                materiel.setNumeroInventaire(dto.getNumeroInventaire());
            }

            // Mettre à jour les observations
            if (dto.getObservations() != null) {
                materiel.setObservations(dto.getObservations());
            }

            // Si au moins un numéro a été assigné, on considère le matériel comme préparé
            if (dto.getNumeroSerie() != null || dto.getNumeroInventaire() != null) {
                // Optionnel: changer l'état si nécessaire
                // materiel.setEtat(Material.EtatMateriel.PREPARE);
            }

            Material saved = materialRepository.save(materiel);
            materielsPrepares.add(saved);
        }

        return materielsPrepares;
    }

    /**
     * Récupérer les matériels par ID de prix
     */
    public List<Material> getMaterielsByPrix(Long prixId) {
        return materialRepository.findByPrixId(prixId);
    }
}