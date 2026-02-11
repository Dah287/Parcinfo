package com.example.parcinfo.dto;


import com.example.parcinfo.model.Prix;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrixDTO {

    private Long id;

    @NotBlank(message = "Le numéro de prix est obligatoire")
    private String numeroPrix;

    @NotBlank(message = "La désignation est obligatoire")
    private String designation;

    @NotBlank(message = "L'unité est obligatoire")
    private String unite;

    @NotNull(message = "La quantité est obligatoire")
    @Min(value = 1, message = "La quantité doit être supérieure à 0")
    private Integer quantite;

    @NotNull(message = "Le prix unitaire HT est obligatoire")
    @DecimalMin(value = "0.0", message = "Le prix unitaire doit être positif")
    private BigDecimal prixUnitaireHT;

    private Long achatId;

    public Prix toEntity() {
        return Prix.builder()
                .numeroPrix(numeroPrix)
                .designation(designation)
                .unite(unite)
                .quantite(quantite)
                .prixUnitaireHT(prixUnitaireHT)
                .build();
    }
}