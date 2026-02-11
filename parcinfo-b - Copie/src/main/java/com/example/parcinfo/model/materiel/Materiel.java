package com.example.parcinfo.model.materiel;
import com.example.parcinfo.model.beneficiaire.Beneficiaire;
import com.example.parcinfo.model.common.BaseEntity;
import com.example.parcinfo.model.entite.Entite;
import com.example.parcinfo.model.prix.Prix;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.Date;

// model/materiel/Materiel.java
@Entity
@Table(name = "materiels")
public class Materiel extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_inventaire", unique = true)
    private String numeroInventaire;

    @Column(name = "numero_serie")
    private String numeroSerie;

    @Column(name = "numero_serie_ecran")
    private String numeroSerieEcran;

    @Column(name = "numero_licence")
    private String numeroLicence;

    @Column(nullable = false)
    private String designation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_materiel_id", nullable = false)
    private TypeMateriel typeMateriel;

    @ManyToOne
    @JoinColumn(name = "prix_id")
    private Prix prix;

    @ManyToOne
    @JoinColumn(name = "marque_id")
    private Marque marque;

    @ManyToOne
    @JoinColumn(name = "ecran_id")
    private Ecran ecran; // Pour les micro-ordinateurs

    @ManyToOne
    @JoinColumn(name = "type_imprimante_id")
    private TypeImprimante typeImprimante; // Pour les imprimantes

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "systeme_exploitation_id")
    private SystemeExploitation systemeExploitation;

    @ManyToOne
    @JoinColumn(name = "beneficiaire_id")
    private Beneficiaire beneficiaire;

    @ManyToOne
    @JoinColumn(name = "entite1_id")
    private Entite entite1;


    @Column(name = "date_acquisition")
    @Temporal(TemporalType.DATE)
    private Date dateAcquisition;

    @Column(name = "date_fin_garantie")
    @Temporal(TemporalType.DATE)
    private Date dateFinGarantie;

    @Column(name = "est_inventorie")
    private Boolean estInventorie = false;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "caracteristique_id")
    private CaracteristiqueTechnique caracteristique;
}