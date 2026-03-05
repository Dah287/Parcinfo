package com.example.parcinfo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "achats")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"fournisseur", "prixList"}) // ✅ EXCLURE LES RELATIONS DU toString()
public class Achat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "La référence est obligatoire")
    @Column(nullable = false, unique = true)
    private String reference;

    private String exercice;

    @NotNull(message = "La date est obligatoire")
    private LocalDate date;

    @NotNull
    @DecimalMin(value = "0.0", message = "Le taux TVA doit être positif")
    @Column(precision = 5, scale = 2)
    private BigDecimal tauxTva = new BigDecimal("20.00");

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeAchat type;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fournisseur_id", nullable = false)
    private Fournisseur fournisseur;


    @OneToMany(mappedBy = "achat", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Prix> prixList = new ArrayList<>(); // ✅ Initialisé comme liste vide

    @Column(columnDefinition = "TEXT")
    private String observations;

    @Column(nullable = false, updatable = false)
    private LocalDate dateCreation;

    public enum TypeAchat {
        MARCHE,
        BON_COMMANDE
    }

    @PrePersist
    public void prePersist() {
        if (this.dateCreation == null) {
            this.dateCreation = LocalDate.now();
        }
    }

    public BigDecimal getMontantTotalHT() {
        // ✅ Ajouter une vérification null pour plus de sécurité
        if (prixList == null) {
            return BigDecimal.ZERO;
        }
        return prixList.stream()
                .map(Prix::getPrixTotalHT)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getMontantTotalTTC() {
        // ✅ Ajouter une vérification null pour plus de sécurité
        if (prixList == null) {
            return BigDecimal.ZERO;
        }
        return getMontantTotalHT().multiply(BigDecimal.ONE.add(tauxTva.divide(new BigDecimal("100"))));
    }
}