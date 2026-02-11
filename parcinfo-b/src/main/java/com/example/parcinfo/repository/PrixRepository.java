package com.example.parcinfo.repository;


import com.example.parcinfo.model.Prix;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PrixRepository extends JpaRepository<Prix, Long> {

    List<Prix> findByAchatId(Long achatId);

    List<Prix> findByDesignationContainingIgnoreCase(String designation);

    @Query("SELECT p FROM Prix p WHERE p.achat.id = :achatId AND p.designation LIKE %:designation%")
    List<Prix> findByAchatIdAndDesignationContaining(
            @Param("achatId") Long achatId,
            @Param("designation") String designation
    );

    long countByAchatId(Long achatId);


}