package com.example.parcinfo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaterielPreparationDTO {
    private String numeroSerie;
    private String numeroInventaire;
    private String observations;
    private Long prixId;
}