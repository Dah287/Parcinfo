package com.example.parcinfo.service;

import com.example.parcinfo.dto.AffectationCompleteDTO;
import com.example.parcinfo.dto.AttributionMaterialDTO;
import com.example.parcinfo.model.Material;
import com.example.parcinfo.model.Beneficiaire;
import com.example.parcinfo.model.TypeOperation;
import com.example.parcinfo.repository.MaterialRepository;
import com.example.parcinfo.repository.BeneficiaireRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaterialService {

    @Autowired
    MaterialRepository materialRepository;
    @Autowired
    BeneficiaireRepository beneficiaireRepository;
    @Autowired
    HistoriqueAttributionService historiqueService;
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
}