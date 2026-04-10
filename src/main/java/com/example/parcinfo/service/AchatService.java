package com.example.parcinfo.service;

import com.example.parcinfo.dto.AchatDTO;
import com.example.parcinfo.dto.PrixDTO;
import com.example.parcinfo.model.Achat;
import com.example.parcinfo.model.Fournisseur;
import com.example.parcinfo.model.Material;
import com.example.parcinfo.model.Prix;
import com.example.parcinfo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AchatService {

    @Autowired
    AchatRepository achatRepository;
    @Autowired PrixRepository prixRepository;
    @Autowired MaterialRepository materialRepository;
    @Autowired FournisseurRepository fournisseurRepository;
    @Autowired MaterialTypeRepository materialTypeRepository;
    @Autowired MaterialGenerationService materialGenerationService;

//    @Transactional
//    public Achat creerAchat(AchatDTO dto) {
//        // Vérifier si la référence existe déjà
//        if (achatRepository.existsByReference(dto.getReference())) {
//            throw new RuntimeException("Une référence d'achat similaire existe déjà");
//        }
//
//        // Vérifier le fournisseur
//        Fournisseur fournisseur = fournisseurRepository.findById(dto.getFournisseurId())
//                .orElseThrow(() -> new RuntimeException("Fournisseur non trouvé"));
//
//        // Créer l'achat
//        Achat achat = dto.toEntity();
//        achat.setFournisseur(fournisseur);
//        achat = achatRepository.save(achat);
//
//        // Créer les prix et générer les matériels
//        for (PrixDTO prixDTO : dto.getPrixList()) {
//            Prix prix = prixDTO.toEntity();
//            prix.setAchat(achat);
//            prix = prixRepository.save(prix);
//
//            // Générer les matériels automatiquement
//            List<Material> materiels = materialGenerationService.genererMateriels(prix, fournisseur);
//            materialRepository.saveAll(materiels);
//
//            prix.setMateriels(materiels);
//            prixRepository.save(prix);
//        }
//
//        return achatRepository.save(achat);
//    }

    @Transactional(readOnly = true)
    public Achat getAchatById(Long id) {
        return achatRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Achat non trouvé"));
    }

    @Transactional(readOnly = true)
    public List<Achat> getAllAchats() {
        return achatRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Achat> searchAchats(String keyword) {
        return achatRepository.searchByKeyword(keyword);
    }

    @Transactional
    public Achat updateAchat(Long id, AchatDTO dto) {
        Achat achat = getAchatById(id);

        if (!achat.getReference().equals(dto.getReference()) &&
                achatRepository.existsByReference(dto.getReference())) {
            throw new RuntimeException("Une référence d'achat similaire existe déjà");
        }

        achat.setReference(dto.getReference());
        achat.setDate(dto.getDate());
        achat.setTauxTva(dto.getTauxTva());
        achat.setType(dto.getType());
        achat.setExercice(dto.getExercice());
        achat.setObservations(dto.getObservations());

        Fournisseur fournisseur = fournisseurRepository.findById(dto.getFournisseurId())
                .orElseThrow(() -> new RuntimeException("Fournisseur non trouvé"));
        achat.setFournisseur(fournisseur);

        return achatRepository.save(achat);
    }

    @Transactional
    public void deleteAchat(Long id) {
        if (!achatRepository.existsById(id)) {
            throw new RuntimeException("Achat non trouvé");
        }
        achatRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Prix> getPrixByAchatId(Long achatId) {
        return prixRepository.findByAchatId(achatId);
    }



    // NOUVEAU
    @Transactional
    public Achat creerAchat(AchatDTO dto) {
        // Vérifier si la référence existe déjà
        if (achatRepository.existsByReference(dto.getReference())) {
            throw new RuntimeException("Une référence d'achat similaire existe déjà");
        }

        // Vérifier le fournisseur
        Fournisseur fournisseur = fournisseurRepository.findById(dto.getFournisseurId())
                .orElseThrow(() -> new RuntimeException("Fournisseur non trouvé"));

        // Créer l'achat
        Achat achat = dto.toEntity();
        achat.setFournisseur(fournisseur);
        achat = achatRepository.save(achat);

        // MODIFIÉ: Créer les prix uniquement s'ils sont fournis
        if (dto.getPrixList() != null && !dto.getPrixList().isEmpty()) {
            for (PrixDTO prixDTO : dto.getPrixList()) {
                Prix prix = prixDTO.toEntity();
                prix.setAchat(achat);
                prix = prixRepository.save(prix);

                // Générer les matériels automatiquement
                List<Material> materiels = materialGenerationService.genererMateriels(prix, fournisseur);
                materialRepository.saveAll(materiels);

                prix.setMateriels(materiels);
                prixRepository.save(prix);
            }
        }

        return achatRepository.save(achat);
    }

    // Ajouter une méthode pour ajouter des prix à un achat existant
    @Transactional
    public void ajouterPrixAchat(Long achatId, List<PrixDTO> prixDTOList) {
        Achat achat = getAchatById(achatId);
        Fournisseur fournisseur = achat.getFournisseur();

        // Récupérer l'exercice de l'achat (String)
        String exercice = achat.getExercice();
        if (exercice == null || exercice.trim().isEmpty()) {
            exercice = String.valueOf(java.time.Year.now().getValue());
        }

        // Récupérer tous les prix existants pour cet achat
        List<Prix> prixExistants = prixRepository.findByAchatId(achatId);

        // Créer un ensemble des numéros de prix existants
        Set<String> numerosExistants = prixExistants.stream()
                .map(Prix::getNumeroPrix)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // Vérifier les doublons dans la liste à ajouter
        Set<String> numerosDansRequete = new HashSet<>();
        List<String> doublons = new ArrayList<>();

        for (PrixDTO prixDTO : prixDTOList) {
            String numeroPrix = prixDTO.getNumeroPrix();

            // Vérifier les doublons dans la même requête
            if (numerosDansRequete.contains(numeroPrix)) {
                doublons.add(numeroPrix);
            }
            numerosDansRequete.add(numeroPrix);

            // Vérifier les doublons avec la base de données
            if (numerosExistants.contains(numeroPrix)) {
                throw new RuntimeException("Le numéro de prix '" + numeroPrix + "' existe déjà pour cet achat !");
            }
        }

        if (!doublons.isEmpty()) {
            throw new RuntimeException("Doublons détectés dans la liste des prix : " + String.join(", ", doublons));
        }

        for (PrixDTO prixDTO : prixDTOList) {
            Prix prix = prixDTO.toEntity();
            prix.setAchat(achat);
            prix = prixRepository.save(prix);

            // Générer les matériels automatiquement
            List<Material> materiels = materialGenerationService.genererMateriels(prix, fournisseur);

            // Affecter l'exercice à chaque matériel
            for (Material material : materiels) {
                material.setExercice(exercice);
            }

            materialRepository.saveAll(materiels);

            prix.setMateriels(materiels);
            prixRepository.save(prix);
        }
    }

    // Ajouter une méthode pour mettre à jour un prix existant
    @Transactional
    public Prix updatePrix(Long prixId, PrixDTO prixDTO) {
        Prix prix = prixRepository.findById(prixId)
                .orElseThrow(() -> new RuntimeException("Prix non trouvé"));

        prix.setNumeroPrix(prixDTO.getNumeroPrix());
        prix.setDesignation(prixDTO.getDesignation());
        prix.setUnite(prixDTO.getUnite());
        prix.setQuantite(prixDTO.getQuantite());
        prix.setPrixUnitaireHT(prixDTO.getPrixUnitaireHT());
        //prix.setObservations(prixDTO.getObservations());

        return prixRepository.save(prix);
    }

    // Ajouter une méthode pour supprimer un prix
    @Transactional
    public void deletePrix(Long prixId) {
        if (!prixRepository.existsById(prixId)) {
            throw new RuntimeException("Prix non trouvé");
        }
        prixRepository.deleteById(prixId);
    }
}