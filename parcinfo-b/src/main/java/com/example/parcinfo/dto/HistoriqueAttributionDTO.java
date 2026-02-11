package com.example.parcinfo.dto;


import com.example.parcinfo.model.TypeOperation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoriqueAttributionDTO {

    private Long id;

    private Long materielId;
    private String numeroInventaire;
    private String typeMateriel;

    private Long ancienBeneficiaireId;
    private String ancienBeneficiaireNom;
    private String ancienBeneficiairePrenom;
    private String ancienBeneficiaireDepartement;

    private Long nouveauBeneficiaireId;
    private String nouveauBeneficiaireNom;
    private String nouveauBeneficiairePrenom;
    private String nouveauBeneficiaireDepartement;

    private TypeOperation typeOperation;
    private String typeOperationLibelle;

    private LocalDateTime dateOperation;
    private LocalDateTime dateAttribution;
    private String commentaire;
}