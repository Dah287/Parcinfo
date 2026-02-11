package com.example.parcinfo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "materiels")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String numeroInventaire;

    @Column(unique = true)
    private String numeroSerie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prix_id", nullable = false)
    @JsonIgnore
    private Prix prix;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_id", nullable = false)
    private MaterialType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marque_id")
    private Marque marque;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "systeme_exploitation_id")
    private SystemeExploitation systemeExploitation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "beneficiaire_id")
    private Beneficiaire beneficiaire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fournisseur_id")
    private Fournisseur fournisseur;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "caracteristiques_materiel",
            joinColumns = @JoinColumn(name = "materiel_id"))
    @MapKeyColumn(name = "cle")
    @Column(name = "valeur")
    private Map<String, String> caracteristiques = new HashMap<>();

    @Enumerated(EnumType.STRING)
    private EtatMateriel etat = EtatMateriel.DISPONIBLE;

    @Column(columnDefinition = "TEXT")
    private String observations;

    @Column(nullable = false, updatable = false)
    private LocalDate dateCreation;

    @Column
    private LocalDate dateAttribution;

    public enum EtatMateriel {
        DISPONIBLE,
        ATTRIBUE,
        EN_PANNE,
        HORS_SERVICE,
        VENDU
    }

    // ✅ AJOUTER CETTE MÉTHODE POUR INITIALISER dateCreation
    @PrePersist
    public void prePersist() {
        if (this.dateCreation == null) {
            this.dateCreation = LocalDate.now();
        }
    }

    public boolean hasCaracteristique(String cle) {
        return caracteristiques.containsKey(cle);
    }

    public String getCaracteristique(String cle) {
        return caracteristiques.get(cle);
    }
}