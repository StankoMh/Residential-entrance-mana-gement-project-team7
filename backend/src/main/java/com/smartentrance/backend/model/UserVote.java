package com.smartentrance.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.Instant;

@Entity
@Table(name = "user_votes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"poll_id", "unit_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poll_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private VotesPoll poll;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private VotesOption option;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private Unit unit;


    @Column(name = "voted_at", nullable = false)
    private Instant votedAt;

    @PrePersist
    protected void onCreate() {
        this.votedAt = Instant.now();
    }
}