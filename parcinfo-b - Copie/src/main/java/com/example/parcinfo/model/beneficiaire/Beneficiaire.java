package com.example.parcinfo.model.beneficiaire;
import com.example.parcinfo.model.common.BaseEntity;
import com.example.parcinfo.model.entite.Entite;
import com.example.parcinfo.model.fournisseur.Fournisseur;
import com.example.parcinfo.model.materiel.Materiel;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

// model/beneficiaire/Beneficiaire.java
@Entity
@Table(name = "beneficiaires")
public class Beneficiaire extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(unique = true)
    private String matricule;

    private String email;
    private String telephone;

    @ManyToOne
    @JoinColumn(name = "entite_principale_id")
    private Entite entitePrincipale;

    @OneToMany(mappedBy = "beneficiaire")
    private List<Materiel> materiels = new ArrayList<>();
}