package com.gameshop.dto.request;

import jakarta.validation.constraints.*;

public record CategoryRequest(
    @NotBlank(message = "Category name is required")
        @Size(min = 2, max = 100, message = "Category name must be between 2 and 100 characters")
        String name) {}
