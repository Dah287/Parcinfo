package com.example.parcinfo.model.materiel;
import com.example.parcinfo.model.common.BaseEntity;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "types_imprimante")
public class TypeImprimante extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", unique = true, nullable = false, length = 50)
    private String code;

    @Column(name = "libelle", nullable = false, length = 100)
    private String libelle;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "format_impression", length = 50)
    private String formatImpression; // A3, A4, etc.

    @Column(name = "couleur")
    private Boolean couleur = false;

    @Column(name = "multifonction")
    private Boolean multifonction = false;

    @Column(name = "technologie", length = 50)
    private String technologie; // Laser, Jet d'encre, Matricielle


    @OneToMany(mappedBy = "typeImprimante")
    private List<Materiel> materiels = new ArrayList<>();
}
