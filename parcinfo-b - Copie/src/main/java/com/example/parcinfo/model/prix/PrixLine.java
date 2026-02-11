package com.example.parcinfo.model.prix;

import jakarta.persistence.*;

import java.math.BigDecimal;

// model/prix/PrixLine.java
@Entity
@Table(name = "prix_lines")
public class PrixLine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "prix_id", nullable = false)
    private Prix prix;

    @Column(name = "numero_ligne")
    private Integer numeroLigne;

    @Column(nullable = false)
    private String designation;

    @Column(nullable = false)
    private String unite;

    @Column(nullable = false)
    private Integer quantite;

    @Column(name = "prix_unitaire_ht", precision = 10, scale = 2)
    private BigDecimal prixUnitaireHT;

    @Column(name = "prix_total_ht", precision = 10, scale = 2)
    private BigDecimal prixTotalHT;

    @PrePersist
    @PreUpdate
    private void calculateTotalHT() {
        if (prixUnitaireHT != null && quantite != null) {
            prixTotalHT = prixUnitaireHT.multiply(new BigDecimal(quantite));
        }
    }
}