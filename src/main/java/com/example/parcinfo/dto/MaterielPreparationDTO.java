package com.example.parcinfo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour la préparation des numéros de série
 * - numeroSerie: OBLIGATOIRE pour l'identification du matériel
 * - numeroSerieEcran: OPTIONNEL, si le matériel inclut un écran
 * - numeroInventaire: IGNORÉ dans ce module (géré ailleurs)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaterielPreparationDTO {

    private String numeroSerie;        // 🔴 OBLIGATOIRE - Clé d'identification
    private String numeroSerieEcran;   // 🟡 OPTIONNEL - Si écran associé
    private String observations;       // 🟡 OPTIONNEL
    private Long prixId;               // 🔴 OBLIGATOIRE - Contexte

    // Le champ numeroInventaire peut exister mais sera ignoré ici
    // private String numeroInventaire; // ❌ Non utilisé dans ce module
}