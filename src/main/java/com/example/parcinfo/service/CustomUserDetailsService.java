package com.example.parcinfo.service;

import com.example.parcinfo.Sec.UserPrincipal;
import com.example.parcinfo.model.Utilisateur;
import com.example.parcinfo.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String matricule) throws UsernameNotFoundException {
        Utilisateur utilisateur = utilisateurRepository.findByMatricule(matricule)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé avec le matricule: " + matricule));

        return UserPrincipal.build(utilisateur);
    }
}