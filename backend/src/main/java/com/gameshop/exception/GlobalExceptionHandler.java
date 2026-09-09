package com.gameshop.exception;

import com.gameshop.dto.response.ApiResponse;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolationException;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.*;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {
  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<ApiResponse<Map<String, String>>> validation(MethodArgumentNotValidException ex) {
    Map<String, String> errors = new LinkedHashMap<>();
    ex.getBindingResult()
        .getFieldErrors()
        .forEach(e -> errors.putIfAbsent(e.getField(), e.getDefaultMessage()));
    log.warn("Request validation failed: {}", errors);
    return ResponseEntity.badRequest().body(ApiResponse.fail("Validation failed", errors));
  }

  @ExceptionHandler(EntityNotFoundException.class)
  ResponseEntity<ApiResponse<Void>> notFound(EntityNotFoundException ex) {
    log.warn("Resource not found: {}", ex.getMessage());
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.fail(ex.getMessage()));
  }

  @ExceptionHandler(AccessDeniedException.class)
  ResponseEntity<ApiResponse<Void>> forbidden(AccessDeniedException ex) {
    log.warn("Access denied: {}", ex.getMessage());
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.fail("Access denied"));
  }

  @ExceptionHandler(AuthException.class)
  ResponseEntity<ApiResponse<Void>> auth(AuthException ex) {
    log.warn("Authentication failed: {}", ex.getMessage());
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.fail(ex.getMessage()));
  }

  @ExceptionHandler(DuplicateEmailException.class)
  ResponseEntity<ApiResponse<Void>> duplicateEmail(DuplicateEmailException ex) {
    log.warn("Duplicate registration attempt");
    return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.fail(ex.getMessage()));
  }

  @ExceptionHandler(ConstraintViolationException.class)
  ResponseEntity<ApiResponse<Map<String, String>>> constraints(ConstraintViolationException ex) {
    Map<String, String> errors = new LinkedHashMap<>();
    ex.getConstraintViolations()
        .forEach(v -> errors.put(v.getPropertyPath().toString(), v.getMessage()));
    log.warn("Request constraint failed: {}", errors);
    return ResponseEntity.badRequest().body(ApiResponse.fail("Validation failed", errors));
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  ResponseEntity<ApiResponse<Void>> unreadable(HttpMessageNotReadableException ex) {
    log.warn("Malformed request body: {}", ex.getMessage());
    return ResponseEntity.badRequest()
        .body(ApiResponse.fail("Request body is malformed or contains an invalid value"));
  }

  @ExceptionHandler({
    DuplicateCategoryException.class,
    InsufficientStockException.class,
    InvalidOrderException.class,
    InvalidProductFilterException.class
  })
  ResponseEntity<ApiResponse<Void>> domain(RuntimeException ex) {
    log.warn("Domain request rejected: {}", ex.getMessage());
    return ResponseEntity.badRequest().body(ApiResponse.fail(ex.getMessage()));
  }

  @ExceptionHandler(Exception.class)
  ResponseEntity<ApiResponse<Void>> unexpected(Exception ex) {
    log.error("Unhandled API error", ex);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(ApiResponse.fail("An unexpected error occurred"));
  }
}
