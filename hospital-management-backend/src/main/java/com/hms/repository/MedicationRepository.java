package com.hms.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.hms.entity.Medication;

@Repository
public interface MedicationRepository extends JpaRepository<Medication, Long> {
    
    List<Medication> findByPrescriptionId(Long prescriptionId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM Medication m WHERE m.prescription.id = :prescriptionId")
    void deleteByPrescriptionId(@Param("prescriptionId") Long prescriptionId);
}