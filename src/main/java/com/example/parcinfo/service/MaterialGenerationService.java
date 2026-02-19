package com.example.parcinfo.service;

import com.example.parcinfo.model.Material;
import com.example.parcinfo.model.MaterialType;
import com.example.parcinfo.model.Prix;
import com.example.parcinfo.model.Fournisseur;
import com.example.parcinfo.repository.MaterialTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MaterialGenerationService {

    @Autowired
    MaterialTypeRepository materialTypeRepository;

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
                    .caracteristiques(genererCaracteristiques(prix)) // ✅ Utiliser les infos du prix
                    .build();

            materiels.add(materiel);
        }

        return materiels;
    }

    /**
     * ✅ Génère les caractéristiques du matériel à partir des informations du prix
     */
    private Map<String, String> genererCaracteristiques(Prix prix) {
        Map<String, String> caracteristiques = new HashMap<>();

        // Récupérer toutes les informations du prix
        if (prix.getNature() != null) caracteristiques.put("Nature", prix.getNature());
        if (prix.getMarque() != null) caracteristiques.put("Marque", prix.getMarque());
        if (prix.getProcesseur() != null) caracteristiques.put("Processeur", prix.getProcesseur());
        if (prix.getDisque() != null) caracteristiques.put("Disque", prix.getDisque());
        if (prix.getVitesse() != null) caracteristiques.put("Vitesse", prix.getVitesse());
        if (prix.getRam() != null) caracteristiques.put("RAM", prix.getRam());
        if (prix.getEcran() != null) caracteristiques.put("Ecran", prix.getEcran());
        if (prix.getSystemeExploitation() != null) caracteristiques.put("Système d'exploitation", prix.getSystemeExploitation());

        // Informations spécifiques
        if (prix.getTypeImprimante() != null) caracteristiques.put("Type d'imprimante", prix.getTypeImprimante());
        if (prix.getFormatPapier() != null) caracteristiques.put("Format papier", prix.getFormatPapier());
        if (prix.getPuissanceOnduleur() != null) caracteristiques.put("Puissance onduleur", prix.getPuissanceOnduleur());

        // Statuts
        caracteristiques.put("Inventorié", prix.getInventorie() != null && prix.getInventorie() ? "Oui" : "Non");
        caracteristiques.put("Dans le parc", prix.getParc() != null && prix.getParc() ? "Oui" : "Non");
        if (prix.getEcranInventorie() != null) {
            caracteristiques.put("Écran inventorié", prix.getEcranInventorie() ? "Oui" : "Non");
        }

        return caracteristiques;
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
                    // Créer un nouveau type SANS caractéristiques obligatoires
                    MaterialType nouveauType = new MaterialType();
                    nouveauType.setDesignation(designationNormalisee);

                    // ✅ PLUS DE CARACTERISTIQUES OBLIGATOIRES

                    // ✅ SAUVEGARDER le type en base AVANT de l'utiliser
                    return materialTypeRepository.save(nouveauType);
                });
    }
}