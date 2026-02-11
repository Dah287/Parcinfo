package com.example.parcinfo.model;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "prix")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prix {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le numéro de prix est obligatoire")
    @Column(nullable = false)
    private String numeroPrix; // Ex: "1"

    @NotBlank(message = "La désignation est obligatoire")
    @Column(nullable = false)
    private String designation; // Ex: "MICRO-ORDINATEUR"

    @NotBlank(message = "L'unité est obligatoire")
    @Column(nullable = false)
    private String unite; // Ex: "U"

    @NotNull(message = "La quantité est obligatoire")
    @Min(value = 1, message = "La quantité doit être supérieure à 0")
    private Integer quantite;

    @NotNull(message = "Le prix unitaire HT est obligatoire")
    @DecimalMin(value = "0.0", message = "Le prix unitaire doit être positif")
    @Column(precision = 15, scale = 2)
    private BigDecimal prixUnitaireHT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "achat_id", nullable = false)
    @JsonIgnore
    private Achat achat;

    @OneToMany(mappedBy = "prix", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Material> materiels = new ArrayList<>();

    public BigDecimal getPrixTotalHT() {
        return prixUnitaireHT.multiply(BigDecimal.valueOf(quantite));
    }

    public BigDecimal getPrixTotalTTC(BigDecimal tauxTva) {
        return getPrixTotalHT().multiply(BigDecimal.ONE.add(tauxTva.divide(new BigDecimal("100"))));
    }

    @PrePersist
    @PreUpdate
    public void validate() {
        if (quantite == null || quantite <= 0) {
            throw new RuntimeException("La quantité doit être supérieure à 0");
        }
        if (prixUnitaireHT == null || prixUnitaireHT.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Le prix unitaire doit être positif");
        }
    }
}