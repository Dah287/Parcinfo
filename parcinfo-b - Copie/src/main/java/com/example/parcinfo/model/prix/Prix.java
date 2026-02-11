package com.example.parcinfo.model.prix;

// model/prix/Prix.java

import com.example.parcinfo.model.achat.Achat;
import com.example.parcinfo.model.common.BaseEntity;
import com.example.parcinfo.model.fournisseur.Fournisseur;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
@Entity
@Table(name = "prix")
public class Prix extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_prix")
    private String numeroPrix;

    @ManyToOne
    @JoinColumn(name = "achat_id")
    private Achat achat;

    @OneToMany(mappedBy = "prix", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PrixLine> prixLines = new ArrayList<>();

    @Column(name = "date_creation")
    @Temporal(TemporalType.TIMESTAMP)
    private Date dateCreation = new Date();
}


