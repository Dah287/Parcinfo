package com.example.parcinfo.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ExcelImportDTO {
    private String numeroPrix;
    private String designation;
    private String nature;
    private String typeImprimante;
    private String marque;
    private Boolean inventorie;
    private Boolean parc;
    private String formatPapier;
    private String puissanceOnduleur;
    private String processeur;
    private String disque;
    private String vitesse;
    private String ram;
    private String ecran;
    private Boolean ecranInventorie;
    private String systemeExploitation;
    private String unite;
    private Integer quantite;
    private BigDecimal prixUnitaireHT;
}