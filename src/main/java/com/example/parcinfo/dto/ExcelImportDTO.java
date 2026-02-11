package com.example.parcinfo.dto;




import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExcelImportDTO {

    private String numeroPrix;
    private String designation;
    private String unite;
    private Integer quantite;
    private BigDecimal prixUnitaireHT;
    private String observations;
}
