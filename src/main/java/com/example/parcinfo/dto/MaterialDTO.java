package com.example.parcinfo.dto;

import com.example.parcinfo.model.Material;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialDTO {

    private Long id;

    private String numeroInventaire; // Optionnel

    private String numeroSerie; // Numéro de série du matériel principal

    // NOUVEAU: Numéro de série de l'écran
    private String numeroSerieEcran;

    @NotNull(message = "Le type de matériel est obligatoire")
    private Long typeId;

    private Long marqueId;
    private String exercice;
    private Long beneficiaireId;

    private Long fournisseurId;

    private Map<String, String> caracteristiques = new HashMap<>();

    private Material.EtatMateriel etat;

    private String observations;

    // Méthode de conversion simplifiée - la génération se fait côté service
    public Material toEntity() {
        return Material.builder()
                .numeroInventaire(numeroInventaire)
                .numeroSerie(numeroSerie)
                .numeroSerieEcran(numeroSerieEcran) // NOUVEAU
                .etat(etat != null ? etat : Material.EtatMateriel.DISPONIBLE)
                .caracteristiques(caracteristiques != null ? caracteristiques : new HashMap<>())
                .observations(observations)
                .exercice(exercice)
                .build();
    }
}