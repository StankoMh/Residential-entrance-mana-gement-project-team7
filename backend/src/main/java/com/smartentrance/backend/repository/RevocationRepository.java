package com.smartentrance.backend.repository;

import com.smartentrance.backend.model.RevocationEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface RevocationRepository extends JpaRepository<RevocationEntry, Integer> {
    @Modifying
    @Transactional
    @Query("DELETE FROM RevocationEntry r WHERE r.revokedAt < :threshold")
    void deleteOlderThan(Long threshold);
}