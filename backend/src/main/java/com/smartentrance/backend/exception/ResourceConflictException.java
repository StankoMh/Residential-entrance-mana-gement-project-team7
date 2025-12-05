package com.smartentrance.backend.exception;

import org.springframework.http.HttpStatus;

public class ResourceConflictException extends BaseException {

    public ResourceConflictException(Class<?> resource, String attribute, Object value) {
        super(HttpStatus.CONFLICT, "Already Exists", resource, attribute, value);
    }

    public ResourceConflictException(String message) {
        super(HttpStatus.CONFLICT, "Resource Conflict", message);
    }
}