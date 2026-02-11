package com.example.parcinfo.model.materiel;

import com.example.parcinfo.model.common.BaseEntity;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

// model/materiel/TypeMateriel.java
@Entity
@Table(name = "types_materiel")
public class TypeMateriel extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", unique = true, nullable = false, length = 50)
    private String code;

    @Column(name = "libelle", nullable = false, length = 100)
    private String libelle;

    @OneToMany(mappedBy = "typeMateriel")
    private List<Materiel> materiels = new ArrayList<>();
}
