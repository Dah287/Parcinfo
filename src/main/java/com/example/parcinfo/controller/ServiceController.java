package com.example.parcinfo.controller;

import com.example.parcinfo.model.Service;
import com.example.parcinfo.service.ServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    @Autowired
    private ServiceService serviceService;

    @GetMapping
    public List<Service> getAllServices() {
        return serviceService.getAllServices();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Service> getServiceById(@PathVariable Long id) {
        return serviceService.getServiceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

//    @GetMapping("/department/{departmentId}")
//    public List<Service> getServicesByDepartment(@PathVariable Long departmentId) {
//        return serviceService.getServicesByDepartment(departmentId);
//    }
//
//    @GetMapping("/search")
//    public List<Service> searchServices(@RequestParam String keyword) {
//        return serviceService.searchServices(keyword);
//    }

    @PostMapping
    public ResponseEntity<Service> createService(@RequestBody Service service) {
        Service createdService = serviceService.createService(service);
        return ResponseEntity.created(URI.create("/api/services/" + createdService.getId()))
                .body(createdService);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Service> updateService(@PathVariable Long id, @RequestBody Service service) {
        if (!serviceService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(serviceService.updateService(id, service));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        if (!serviceService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        serviceService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}