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
@ToString(exclude = {"achat", "materiels"})
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

    // NOUVEAU: Nature du matériel
    @Column
    private String nature; // Ex: "Ordinateur", "Imprimante", "Onduleur", "Scanner", etc.

    // NOUVEAU: Type d'imprimante
    @Column
    private String typeImprimante; // Ex: "Laser", "Jet d'encre", "Thermique", "Matricielle"

    // NOUVEAU: Marque
    @Column
    private String marque; // Ex: "HP", "Dell", "Epson", "Canon"

    // NOUVEAU: Prix total calculé
    @Column(precision = 15, scale = 2)
    private BigDecimal prixTotal; // Quantité × prix unitaire HT

    // NOUVEAU: Statut inventaire
    @Column
    private Boolean inventorie = false; // true = inventorié, false = non inventorié

    // NOUVEAU: Statut parc
    @Column
    private Boolean parc = false; // true = dans le parc, false = hors parc

    // NOUVEAU: Format papier pour imprimantes
    @Column
    private String formatPapier; // Ex: "A4", "A3", "A4/A3"

    // NOUVEAU: Puissance onduleur (en VA)
    @Column
    private String puissanceOnduleur; // Ex: "1000VA", "2000VA"

    // NOUVEAU: Processeur
    @Column
    private String processeur; // Ex: "Intel Core i5", "AMD Ryzen 7"

    // NOUVEAU: Disque
    @Column
    private String disque; // Ex: "512GB SSD", "1TB HDD"

    // NOUVEAU: Vitesse (pour imprimantes, processeurs)
    @Column
    private String vitesse; // Ex: "3.4 GHz", "20 ppm"

    // NOUVEAU: RAM
    @Column
    private String ram; // Ex: "8GB", "16GB"

    // NOUVEAU: Écran (taille)
    @Column
    private String ecran; // Ex: "15.6 pouces", "24 pouces"

    // NOUVEAU: Écran inventorié (pour les écrans séparés)
    @Column
    private Boolean ecranInventorie = false; // true = écran inventorié séparément

    // NOUVEAU: Système d'exploitation
    @Column
    private String systemeExploitation; // Ex: "Windows 11", "Ubuntu 22.04"

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
        // Calculer automatiquement le prix total
        if (prixUnitaireHT != null && quantite != null) {
            this.prixTotal = prixUnitaireHT.multiply(BigDecimal.valueOf(quantite));
        }
    }
}