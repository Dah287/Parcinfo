package com.example.parcinfo.service;

import com.example.parcinfo.model.Bureau;
import com.example.parcinfo.repository.BureauRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class BureauService {

    @Autowired
    private BureauRepository bureauRepository;

    public List<Bureau> getAllBureaux() {
        return bureauRepository.findAll();
    }

    public Optional<Bureau> getBureauById(Long id) {
        return bureauRepository.findById(id);
    }

    public Bureau createBureau(Bureau bureau) {
        return bureauRepository.save(bureau);
    }

    public Bureau updateBureau(Long id, Bureau bureau) {
        bureau.setId(id);
        return bureauRepository.save(bureau);
    }

    public void deleteBureau(Long id) {
        bureauRepository.deleteById(id);
    }

    public boolean existsById(Long id) {
        return bureauRepository.existsById(id);
    }
}