package com.example.parcinfo.dto;

import com.example.parcinfo.model.achat.ModeAchat;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Data
public class AchatCreateDTO {
    private ModeAchat modeAchat;
    private String reference;
    private Date date;
    private Integer anneeExercice;
    private Date dateReception;
    private Integer garantieAnnees;
    private String commentaire;
    private Long fournisseurId;
    private List<PrixLineCreateDTO> prixLines;
}