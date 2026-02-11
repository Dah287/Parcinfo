package com.example.parcinfo.model.materiel;
import com.example.parcinfo.model.common.BaseEntity;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

// model/materiel/Marque.java
@Entity
@Table(name = "marques")
public class Marque extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom", unique = true, nullable = false, length = 100)
    private String nom;

    @Column(name = "actif")
    private Boolean actif = true;

    @OneToMany(mappedBy = "marque")
    private List<Materiel> materiels = new ArrayList<>();
}
