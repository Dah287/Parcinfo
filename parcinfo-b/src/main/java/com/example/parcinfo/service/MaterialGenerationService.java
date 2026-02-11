package com.example.parcinfo.service;

import com.example.parcinfo.model.Material;
import com.example.parcinfo.model.MaterialType;
import com.example.parcinfo.model.Prix;
import com.example.parcinfo.model.Fournisseur;
import com.example.parcinfo.repository.MaterialTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MaterialGenerationService {

    private final MaterialTypeRepository materialTypeRepository;

    @Transactional
    public List<Material> genererMateriels(Prix prix, Fournisseur fournisseur) {
        List<Material> materiels = new ArrayList<>();

        // ✅ Trouver ou créer ET SAUVEGARDER le type de matériel
        MaterialType type = trouverOuCreeTypeMateriel(prix.getDesignation());

        // Générer les matériels selon la quantité
        for (int i = 0; i < prix.getQuantite(); i++) {
            Material materiel = Material.builder()
                    .prix(prix)
                    .type(type)  // ✅ Type déjà sauvegardé
                    .fournisseur(fournisseur)
                    .etat(Material.EtatMateriel.DISPONIBLE)
                    .caracteristiques(genererCaracteristiquesParDefaut(type))
                    .build();

            materiels.add(materiel);
        }

        return materiels;
    }

    /**
     * ✅ Trouve le type existant ou crée et sauvegarde un nouveau type
     */
    private MaterialType trouverOuCreeTypeMateriel(String designation) {
        // Normaliser la désignation
        String designationNormalisee = designation.toUpperCase().trim();

        // Chercher si le type existe déjà
        return materialTypeRepository.findByDesignation(designationNormalisee)
                .orElseGet(() -> {
                    // Créer un nouveau type
                    MaterialType nouveauType = new MaterialType();
                    nouveauType.setDesignation(designationNormalisee);
                    nouveauType.setCaracteristiquesObligatoires(
                            creerCaracteristiquesObligatoires(designationNormalisee)
                    );

                    // ✅ SAUVEGARDER le type en base AVANT de l'utiliser
                    return materialTypeRepository.save(nouveauType);
                });
    }

    private Map<String, String> creerCaracteristiquesObligatoires(String designation) {
        Map<String, String> caracteristiques = new HashMap<>();

        if (designation.contains("ORDINATEUR") ||
                designation.contains("PC") ||
                designation.contains("MICRO")) {
            caracteristiques.put("Ecran", "Oui");
            caracteristiques.put("Processeur", "À définir");
            caracteristiques.put("RAM", "À définir");
            caracteristiques.put("Stockage", "À définir");
            caracteristiques.put("SystemeExploitation", "À définir");
        }
        else if (designation.contains("IMPRIMANTE")) {
            caracteristiques.put("TypeImprimante", "À définir");
            caracteristiques.put("Couleur", "À définir");
        }
        else if (designation.contains("ECRAN")) {
            caracteristiques.put("Taille", "À définir");
            caracteristiques.put("Resolution", "À définir");
        }

        return caracteristiques;
    }

    private Map<String, String> genererCaracteristiquesParDefaut(MaterialType type) {
        Map<String, String> caracteristiques = new HashMap<>();

        if (type.getCaracteristiquesObligatoires() != null) {
            caracteristiques.putAll(type.getCaracteristiquesObligatoires());
        }

        return caracteristiques;
    }
}