package com.example.parcinfo.dto;

import com.example.parcinfo.model.Beneficiaire;
import com.example.parcinfo.model.Material;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PriseEnChargeDTO {
    private Beneficiaire beneficiaire;
    private List<Material> materiels;
}