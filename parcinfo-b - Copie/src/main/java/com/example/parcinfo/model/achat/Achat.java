package com.example.parcinfo.model.achat;

import com.example.parcinfo.model.common.BaseEntity;
import com.example.parcinfo.model.fournisseur.Fournisseur;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

// model/achat/Achat.java
@Entity
@Table(name = "achats")
public class Achat extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String codeAchat;

    @Enumerated(EnumType.STRING)
    private ModeAchat modeAchat;

    @Column(nullable = false)
    private String reference;

    @Temporal(TemporalType.DATE)
    private Date date;

    @Column(name = "annee_exercice")
    private Integer anneeExercice;

    @Column(name = "taux_tva")
    private BigDecimal tauxTVA = new BigDecimal("20.00");

    @Temporal(TemporalType.DATE)
    private Date dateReception;

    @Column(name = "garantie_annees")
    private Integer garantieAnnees;

    @Column(columnDefinition = "TEXT")
    private String commentaire;

    @OneToMany(mappedBy = "achat", cascade = CascadeType.ALL)
    private List<AchatPrixAssociation> prixAssociations = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "fournisseur_id")
    private Fournisseur fournisseur;
}


