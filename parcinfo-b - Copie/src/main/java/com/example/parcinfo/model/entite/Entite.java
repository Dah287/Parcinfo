package com.example.parcinfo.model.entite;
import com.example.parcinfo.model.common.BaseEntity;
import com.example.parcinfo.model.fournisseur.Fournisseur;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

// model/entite/Entite.java
@Entity
@Table(name = "entites")
public class Entite extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Column(nullable = false)
    private String nom;

    private String description;

    @ManyToOne
    @JoinColumn(name = "entite_parent_id")
    private Entite entiteParent;

    @OneToMany(mappedBy = "entiteParent")
    private List<Entite> sousEntites = new ArrayList<>();
}