package com.example.parcinfo.dto;

import lombok.Data;

import java.util.Date;

@Data
public class MaterielDTO {
    private Long id;
    private String numeroInventaire;
    private String numeroSerie;
    private String numeroSerieEcran;
    private String numeroLicence;
    private String designation;
    private Long typeMaterielId;
    private Long prixId;
    private Long marqueId;
    private Long ecranId;
    private Long typeImprimanteId;
    private Long systemeExploitationId;
    private Long beneficiaireId;
    private Long entite1Id;
    private Date dateAcquisition;
    private Date dateFinGarantie;
    private Boolean estInventorie;
}