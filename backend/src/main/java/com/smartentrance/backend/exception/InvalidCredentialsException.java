package com.smartentrance.backend.exception;

import org.springframework.http.HttpStatus;

public class InvalidCredentialsException extends BaseException {

    public InvalidCredentialsException(String message) {
        super(HttpStatus.UNAUTHORIZED, "Authentication Failed", message);
    }
}