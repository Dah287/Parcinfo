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

    // Nouveaux champs
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
        Prix.PrixBuilder builder = Prix.builder()
                .numeroPrix(numeroPrix)
                .designation(designation)
                .nature(nature)
                .typeImprimante(typeImprimante)
                .marque(marque)
                .inventorie(inventorie != null ? inventorie : false)
                .parc(parc != null ? parc : false)
                .formatPapier(formatPapier)
                .puissanceOnduleur(puissanceOnduleur)
                .processeur(processeur)
                .disque(disque)
                .vitesse(vitesse)
                .ram(ram)
                .ecran(ecran)
                .ecranInventorie(ecranInventorie != null ? ecranInventorie : false)
                .systemeExploitation(systemeExploitation)
                .unite(unite)
                .quantite(quantite)
                .prixUnitaireHT(prixUnitaireHT);

        return builder.build();
    }
}