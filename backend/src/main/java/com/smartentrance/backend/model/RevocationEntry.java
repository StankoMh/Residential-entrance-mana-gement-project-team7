package com.smartentrance.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "token_revocations")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RevocationEntry {

    @Id
    private Long userId;

    private Long revokedAt;
}