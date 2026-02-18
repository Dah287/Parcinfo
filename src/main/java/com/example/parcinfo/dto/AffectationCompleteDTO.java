package com.example.parcinfo.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class AffectationCompleteDTO {
    private Long achatId;
    private Long beneficiaireId;
    private List<Long> materielIds; // Un matériel par prix de l'achat
    private LocalDate dateAttribution;
    private String observations;
}