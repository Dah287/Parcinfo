// DemandeReaffectation.java - Version hybride
package com.example.parcinfo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "demandes_reaffectation")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandeReaffectation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Garder l'ancien champ pour compatibilité (peut être null)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "materiel_id")
    private Material materiel;

    // Nouveau champ pour les demandes groupées
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "demande_reaffectation_materiels",
            joinColumns = @JoinColumn(name = "demande_id"),
            inverseJoinColumns = @JoinColumn(name = "materiel_id")
    )
    private List<Material> materiels = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "beneficiaire_source_id", nullable = false)
    private Beneficiaire beneficiaireSource;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "beneficiaire_destination_id", nullable = false)
    private Beneficiaire beneficiaireDestination;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demandeur_id", nullable = false)
    private Utilisateur demandeur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "validateur_id")
    private Utilisateur validateur;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutDemande statut = StatutDemande.EN_ATTENTE;

    private LocalDateTime dateDemande;

    private LocalDateTime dateValidation;

    private String observations;

    private String motifRejet;

    @Column(columnDefinition = "TEXT")
    private String historiqueValidation;

    @PrePersist
    protected void onCreate() {
        dateDemande = LocalDateTime.now();
    }

    public enum StatutDemande {
        EN_ATTENTE("En attente de validation"),
        VALIDEE("Validée - Réaffectation effectuée"),
        REJETEE("Rejetée");

        private final String libelle;

        StatutDemande(String libelle) {
            this.libelle = libelle;
        }

        public String getLibelle() {
            return libelle;
        }
    }

    // Méthode utilitaire pour obtenir tous les matériels (anciens + nouveaux)
    public List<Material> getAllMateriels() {
        List<Material> all = new ArrayList<>();
        if (materiel != null) {
            all.add(materiel);
        }
        if (materiels != null) {
            all.addAll(materiels);
        }
        return all;
    }
}