package com.example.parcinfo.controller;

import com.example.parcinfo.model.Bureau;
import com.example.parcinfo.service.BureauService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/bureaux")
public class BureauController {

    @Autowired
    private BureauService bureauService;

    @GetMapping
    public List<Bureau> getAllBureaux() {
        return bureauService.getAllBureaux();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bureau> getBureauById(@PathVariable Long id) {
        return bureauService.getBureauById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

//    @GetMapping("/search")
//    public List<Bureau> searchBureaux(@RequestParam String keyword) {
//        return bureauService.searchBureaux(keyword);
//    }

    @PostMapping
    public ResponseEntity<Bureau> createBureau(@RequestBody Bureau bureau) {
        Bureau createdBureau = bureauService.createBureau(bureau);
        return ResponseEntity.created(URI.create("/api/bureaux/" + createdBureau.getId()))
                .body(createdBureau);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Bureau> updateBureau(@PathVariable Long id, @RequestBody Bureau bureau) {
        if (!bureauService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(bureauService.updateBureau(id, bureau));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBureau(@PathVariable Long id) {
        if (!bureauService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        bureauService.deleteBureau(id);
        return ResponseEntity.noContent().build();
    }
}