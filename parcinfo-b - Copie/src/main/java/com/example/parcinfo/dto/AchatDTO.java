// dto/achat/AchatDTO.java
package com.example.parcinfo.dto;

import com.example.parcinfo.model.achat.ModeAchat;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Data
public class AchatDTO {
    private Long id;
    private String codeAchat;
    private ModeAchat modeAchat;
    private String reference;
    private Date date;
    private Integer anneeExercice;
    private BigDecimal tauxTVA = new BigDecimal("20.00");
    private Date dateReception;
    private Integer garantieAnnees;
    private String commentaire;
    private Long fournisseurId;
    private List<PrixDTO> prixList;
}