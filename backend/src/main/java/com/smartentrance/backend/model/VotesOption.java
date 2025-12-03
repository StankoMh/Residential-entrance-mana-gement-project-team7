package com.smartentrance.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "votes_options")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VotesOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "poll_id", nullable = false)
    @NotNull
    @JsonIgnore
    @ToString.Exclude
    private VotesPoll poll;

    @Column(name = "option_text", nullable = false)
    @NotNull @NotBlank
    private String optionText;
}