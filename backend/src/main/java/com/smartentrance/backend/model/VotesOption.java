package com.smartentrance.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "votes_options")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VotesOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "option_text", nullable = false)
    @NotNull @NotBlank
    private String optionText;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poll_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private VotesPoll poll;

    @OneToMany(mappedBy = "option", cascade = CascadeType.ALL)
    @JsonIgnore
    @ToString.Exclude
    private List<UserVote> votes = new ArrayList<>();
}