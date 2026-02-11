package com.example.parcinfo.dto;



import lombok.Data;

import java.math.BigDecimal;

@Data
public class PrixLineDTO {
    private Long id;
    private Integer numeroLigne;
    private String designation;
    private String unite;
    private Integer quantite;
    private BigDecimal prixUnitaireHT;
    private BigDecimal prixTotalHT;
}