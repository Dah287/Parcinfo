package com.example.parcinfo.service;

import com.example.parcinfo.dto.BeneficiaireDTO;
import com.example.parcinfo.model.Beneficiaire;
import com.example.parcinfo.repository.BeneficiaireRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BeneficiaireService {

    @Autowired
    BeneficiaireRepository beneficiaireRepository;

    @Transactional(readOnly = true)
    public List<Beneficiaire> getAllBeneficiaires() {
        return beneficiaireRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Beneficiaire> getBeneficiaireById(Long id) {
        return beneficiaireRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Beneficiaire> searchBeneficiaires(String keyword) {
        return beneficiaireRepository.searchByKeyword(keyword);
    }

    @Transactional(readOnly = true)
    public List<Beneficiaire> getBeneficiairesByDepartement(String departement) {
        return beneficiaireRepository.findByDepartement(departement);
    }

    @Transactional
    public Beneficiaire createBeneficiaire(BeneficiaireDTO dto) {
        // Vérifier si un bénéficiaire avec le même nom/prénom existe déjà
        if (beneficiaireRepository.existsByNomAndPrenom(dto.getNom(), dto.getPrenom())) {
            throw new RuntimeException("Un bénéficiaire avec ce nom et prénom existe déjà");
        }

        Beneficiaire beneficiaire = dto.toEntity();
        return beneficiaireRepository.save(beneficiaire);
    }

    @Transactional
    public Beneficiaire updateBeneficiaire(Long id, BeneficiaireDTO dto) {
        Beneficiaire beneficiaire = beneficiaireRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bénéficiaire non trouvé"));

        beneficiaire.setNom(dto.getNom());
        beneficiaire.setPrenom(dto.getPrenom());
        beneficiaire.setTelephone(dto.getTelephone());
        beneficiaire.setEmail(dto.getEmail());
        beneficiaire.setDepartement(dto.getDepartement());
        beneficiaire.setFonction(dto.getFonction());

        return beneficiaireRepository.save(beneficiaire);
    }

    @Transactional
    public void deleteBeneficiaire(Long id) {
        if (!beneficiaireRepository.existsById(id)) {
            throw new RuntimeException("Bénéficiaire non trouvé");
        }
        beneficiaireRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public boolean existsById(Long id) {
        return beneficiaireRepository.existsById(id);
    }
}