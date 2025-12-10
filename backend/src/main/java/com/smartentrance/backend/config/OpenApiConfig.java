package com.smartentrance.backend.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Smart Entrance API",
                version = "1.0",
                description = "API Documentation (Auth via HttpOnly Cookies)"
        )
)
public class OpenApiConfig {
}