package com.smartentrance.backend.exception;

import lombok.NonNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.web.ErrorResponse;

public abstract class BaseException extends RuntimeException implements ErrorResponse {

    private final ProblemDetail body;

    protected BaseException(HttpStatus status, String title, String detail) {
        super(detail);
        this.body = ProblemDetail.forStatusAndDetail(status, detail);
        this.body.setTitle(title);
    }

    protected BaseException(HttpStatus status, String title, Class<?> resource, String attributeName, Object attributeValue) {
        super(String.format("%s with %s='%s' %s",
                extractResourceName(resource), attributeName, attributeValue, title.toLowerCase()));

        this.body = ProblemDetail.forStatusAndDetail(status, getMessage());
        this.body.setTitle(title);

        this.body.setProperty("resource", extractResourceName(resource));
        this.body.setProperty("search_field", attributeName);
        this.body.setProperty("search_value", attributeValue);
    }

    @Override
    @NonNull
    public HttpStatusCode getStatusCode() {
        return body.getStatus() != 0 ? HttpStatus.valueOf(body.getStatus()) : HttpStatus.INTERNAL_SERVER_ERROR;
    }

    @Override
    @NonNull
    public ProblemDetail getBody() {
        return body;
    }

    protected static String extractResourceName(Class<?> resource) {
        return resource == null ? "Resource" : resource.getSimpleName();
    }
}