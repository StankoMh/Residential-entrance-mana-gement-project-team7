package com.smartentrance.backend.dto;

import com.smartentrance.backend.model.enums.UserRole;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterUserRequest {
    @NotBlank
    private String fullName;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    // @Size(min = 8, message = "Password must be at least 8 characters long")
    // @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$", message = "Password must contain uppercase, lowercase and number")
    // Uncomment the above annotations to enforce password complexity rules
    private String password;

    @NotNull
    private UserRole role;
}