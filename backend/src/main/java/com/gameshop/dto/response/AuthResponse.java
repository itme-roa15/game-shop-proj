package com.gameshop.dto.response;

public record AuthResponse(
    String token,
    String tokenType,
    long expiresInMs,
    Long userId,
    String name,
    String email,
    String role) {}
