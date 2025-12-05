package com.smartentrance.backend.exception;

import org.springframework.http.HttpStatus;

public class PermissionDeniedException extends BaseException {

    public PermissionDeniedException(String message) {
        super(HttpStatus.FORBIDDEN, "Access Denied", message);
    }
}