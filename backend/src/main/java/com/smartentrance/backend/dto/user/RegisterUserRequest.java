package com.smartentrance.backend.dto.user;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterUserRequest {
    @NotBlank
    private String firstName;

    private String lastName;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    private boolean rememberMe;
}