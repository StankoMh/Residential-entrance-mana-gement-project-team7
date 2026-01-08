package com.smartentrance.backend.mapper;

import com.smartentrance.backend.dto.user.UserRegisterRequest;
import com.smartentrance.backend.dto.user.UserResponse;
import com.smartentrance.backend.model.User;
import com.smartentrance.backend.model.enums.UserRole;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }

        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());

        return response;
    }

    public User toEntity(UserRegisterRequest request) {
        if (request == null) {
            return null;
        }

        return User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .role(UserRole.USER)
                .build();
    }
}