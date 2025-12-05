package com.smartentrance.backend.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends BaseException {

    public ResourceNotFoundException(Class<?> resource, String attribute, Object value) {
        super(HttpStatus.NOT_FOUND, "Not Found", resource, attribute, value);
    }
}