package com.example.parcinfo.dto;

import com.example.parcinfo.model.Achat;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AchatDTO {

    private Long id;

    @NotBlank(message = "La référence est obligatoire")
    private String reference;

    private String exercice;

    @NotNull(message = "La date est obligatoire")
    private LocalDate date;

    @DecimalMin(value = "0.0", message = "Le taux TVA doit être positif")
    private BigDecimal tauxTva = new BigDecimal("20.00");

    @NotNull(message = "Le type d'achat est obligatoire")
    private Achat.TypeAchat type;

    @NotNull(message = "Le fournisseur est obligatoire")
    private Long fournisseurId;

    // Modifier: Rendre les prix optionnels
    private List<PrixDTO> prixList = new ArrayList<>();

    private String observations;

    public Achat toEntity() {
        return Achat.builder()
                .reference(reference)
                .date(date)
                .tauxTva(tauxTva)
                .type(type)
                .exercice(exercice)
                .observations(observations)
                .build();
    }
}