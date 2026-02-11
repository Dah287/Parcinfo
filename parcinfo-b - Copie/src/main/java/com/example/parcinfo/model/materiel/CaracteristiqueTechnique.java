package com.example.parcinfo.model.materiel;

import jakarta.persistence.*;

// model/materiel/CaracteristiqueTechnique.java
@Entity
@Table(name = "caracteristiques_techniques")
public class CaracteristiqueTechnique {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String format;
    private String processeur;
    private String vitesseProcesseur;
    private String ram;
    private String disqueDur;

    @OneToOne(mappedBy = "caracteristique")
    private Materiel materiel;
}