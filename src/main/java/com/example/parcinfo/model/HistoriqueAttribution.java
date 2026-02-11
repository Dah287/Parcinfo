package com.example.parcinfo.model;

import com.example.parcinfo.model.Beneficiaire;
import com.example.parcinfo.model.Material;
import com.example.parcinfo.model.TypeOperation;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "historique_attribution")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoriqueAttribution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "materiel_id", nullable = false)
    private Material materiel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ancien_beneficiaire_id")
    private Beneficiaire ancienBeneficiaire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nouveau_beneficiaire_id")
    private Beneficiaire nouveauBeneficiaire;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeOperation typeOperation;

    @Column(name = "date_operation", nullable = false)
    private LocalDateTime dateOperation;

    @Column(name = "date_attribution", nullable = false)
    private LocalDateTime dateAttribution;

    @Column(length = 500)
    private String commentaire;

    @PrePersist
    public void prePersist() {
        this.dateOperation = LocalDateTime.now();
    }
}