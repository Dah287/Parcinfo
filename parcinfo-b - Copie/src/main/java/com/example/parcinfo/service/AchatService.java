package com.example.parcinfo.service;



import com.example.parcinfo.exception.ResourceNotFoundException;
import com.example.parcinfo.model.achat.Achat;
import com.example.parcinfo.model.achat.AchatPrixAssociation;
import com.example.parcinfo.model.fournisseur.Fournisseur;
import com.example.parcinfo.model.materiel.Materiel;
import com.example.parcinfo.model.materiel.TypeMateriel;
import com.example.parcinfo.model.prix.Prix;
import com.example.parcinfo.model.prix.PrixLine;
import com.example.parcinfo.repository.AchatRepository;
import com.example.parcinfo.repository.FournisseurRepository;
import com.example.parcinfo.repository.PrixRepository;
import com.example.parcinfo.repository.TypeMaterielRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AchatService {

    private final AchatRepository achatRepository;
    private final FournisseurRepository fournisseurRepository;
    private final PrixRepository prixRepository;
    private final TypeMaterielRepository typeMaterielRepository;
    private final AchatMapper achatMapper;

    @Transactional
    public AchatDTO createAchat(AchatCreateDTO achatCreateDTO) {
        // Récupérer le fournisseur
        Fournisseur fournisseur = fournisseurRepository.findById(achatCreateDTO.getFournisseurId())
                .orElseThrow(() -> new ResourceNotFoundException("Fournisseur non trouvé"));

        // Créer l'achat
        Achat achat = new Achat();
        achat.setCodeAchat("ACH-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        achat.setModeAchat(achatCreateDTO.getModeAchat());
        achat.setReference(achatCreateDTO.getReference());
        achat.setDate(achatCreateDTO.getDate());
        achat.setAnneeExercice(achatCreateDTO.getAnneeExercice());
        achat.setDateReception(achatCreateDTO.getDateReception());
        achat.setGarantieAnnees(achatCreateDTO.getGarantieAnnees());
        achat.setCommentaire(achatCreateDTO.getCommentaire());
        achat.setFournisseur(fournisseur);

        // Sauvegarder l'achat
        Achat savedAchat = achatRepository.save(achat);

        // Créer le prix associé
        if (achatCreateDTO.getPrixLines() != null && !achatCreateDTO.getPrixLines().isEmpty()) {
            Prix prix = new Prix();
            prix.setNumeroPrix("PRIX-" + savedAchat.getId() + "-001");
            prix.setAchat(savedAchat);

            List<PrixLine> prixLines = new ArrayList<>();
            int lineNumber = 1;

            for (var lineDTO : achatCreateDTO.getPrixLines()) {
                PrixLine prixLine = new PrixLine();
                prixLine.setPrix(prix);
                prixLine.setNumeroLigne(lineNumber++);
                prixLine.setDesignation(lineDTO.getDesignation());
                prixLine.setUnite(lineDTO.getUnite());
                prixLine.setQuantite(lineDTO.getQuantite());
                prixLine.setPrixUnitaireHT(lineDTO.getPrixUnitaireHT());
                prixLines.add(prixLine);
            }

            prix.setPrixLines(prixLines);
            Prix savedPrix = prixRepository.save(prix);

            // Associer le prix à l'achat
            AchatPrixAssociation association = new AchatPrixAssociation();
            association.setAchat(savedAchat);
            association.setPrix(savedPrix);
            savedAchat.getPrixAssociations().add(association);

            // Créer les matériels correspondants
            createMaterielsFromPrix(savedPrix);
        }

        return achatMapper.toDTO(savedAchat);
    }

    private void createMaterielsFromPrix(Prix prix) {
        // Cette méthode devrait être dans un service dédié pour les matériels
        // Logique simplifiée pour la démonstration
        for (PrixLine line : prix.getPrixLines()) {
            TypeMateriel typeMateriel = determineTypeMaterielFromDesignation(line.getDesignation());

            // Pour chaque unité dans la quantité
            for (int i = 0; i < line.getQuantite(); i++) {
                Materiel materiel = new Materiel();
                materiel.setDesignation(line.getDesignation());
                materiel.setTypeMateriel(typeMateriel);
                materiel.setPrix(prix);
                materiel.setDateAcquisition(prix.getAchat().getDate());

                if (typeMateriel.getCode().equals("MICRO_ORD")) {
                    // Pour les micro-ordinateurs, nécessite un écran
                    materiel.setNumeroInventaire("INV-" + UUID.randomUUID().toString().substring(0, 6));
                } else if (typeMateriel.getCode().equals("IMPRIMANTE")) {
                    materiel.setNumeroInventaire("IMP-" + UUID.randomUUID().toString().substring(0, 6));
                }

                // Sauvegarder le matériel (nécessite un repository Materiel)
                // materielRepository.save(materiel);
            }
        }
    }

    private TypeMateriel determineTypeMaterielFromDesignation(String designation) {
        // Logique de détermination du type de matériel basée sur la désignation
        // À adapter selon vos besoins
        if (designation.toLowerCase().contains("micro-ordinateur") ||
                designation.toLowerCase().contains("pc portable")) {
            return typeMaterielRepository.findByCode("MICRO_ORD")
                    .orElseGet(() -> {
                        TypeMateriel type = new TypeMateriel();
                        type.setCode("MICRO_ORD");
                        type.setLibelle("Micro-ordinateur");
                        return typeMaterielRepository.save(type);
                    });
        } else if (designation.toLowerCase().contains("imprimante")) {
            return typeMaterielRepository.findByCode("IMPRIMANTE")
                    .orElseGet(() -> {
                        TypeMateriel type = new TypeMateriel();
                        type.setCode("IMPRIMANTE");
                        type.setLibelle("Imprimante");
                        return typeMaterielRepository.save(type);
                    });
        } else if (designation.toLowerCase().contains("onduleur")) {
            return typeMaterielRepository.findByCode("ONDULEUR")
                    .orElseGet(() -> {
                        TypeMateriel type = new TypeMateriel();
                        type.setCode("ONDULEUR");
                        type.setLibelle("Onduleur");
                        return typeMaterielRepository.save(type);
                    });
        }

        // Type par défaut
        return typeMaterielRepository.findByCode("AUTRE")
                .orElseGet(() -> {
                    TypeMateriel type = new TypeMateriel();
                    type.setCode("AUTRE");
                    type.setLibelle("Autre équipement");
                    return typeMaterielRepository.save(type);
                });
    }

    public AchatDTO getAchatById(Long id) {
        Achat achat = achatRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Achat non trouvé"));
        return achatMapper.toDTO(achat);
    }

    public List<AchatDTO> getAllAchats() {
        return achatRepository.findAll().stream()
                .map(achatMapper::toDTO)
                .toList();
    }
}