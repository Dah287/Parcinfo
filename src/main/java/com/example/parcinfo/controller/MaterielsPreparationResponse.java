package com.example.parcinfo.controller;


import com.example.parcinfo.model.Material;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaterielsPreparationResponse {

    private List<Material> aPreparer;           // Avec série, SANS inventaire → à saisir
    private List<Material> dejaAttribues;       // Avec série ET inventaire → modifiable
    private List<Material> enAttenteSerie;      // Sans série → bloqué

    // Stats pour la progression
    private long totalWithSerial;               // aPreparer.size() + dejaAttribues.size()
    private long totalPrepared;                 // dejaAttribues.size()
}