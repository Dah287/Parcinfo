package com.example.parcinfo.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaterielInventaireDTO {

    private String numeroSerie;        // Clé d'identification (obligatoire)
    private String numeroInventaire;   // Nouveau numéro à attribuer (obligatoire)

    // Validation basique
    public boolean isValid() {
        return numeroSerie != null && !numeroSerie.trim().isEmpty() &&
                numeroInventaire != null && !numeroInventaire.trim().isEmpty();
    }
}