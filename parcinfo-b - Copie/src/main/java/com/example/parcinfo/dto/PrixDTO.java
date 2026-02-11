package com.example.parcinfo.dto;

import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class PrixDTO {
    private Long id;
    private String numeroPrix;
    private Long achatId;
    private Date dateCreation;
    private List<PrixLineDTO> prixLines;
}