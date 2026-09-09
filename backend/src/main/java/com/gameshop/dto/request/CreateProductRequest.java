package com.gameshop.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record CreateProductRequest(
    @NotNull(message = "Category is required") @Positive(message = "Category id must be positive")
        Long categoryId,
    @NotBlank(message = "Product name is required")
        @Size(min = 2, max = 200, message = "Product name must be between 2 and 200 characters")
        String name,
    @Size(max = 10000, message = "Description must not exceed 10000 characters") String description,
    @NotNull(message = "Price is required")
        @DecimalMin(value = "0.01", message = "Price must be greater than zero")
        @Digits(
            integer = 8,
            fraction = 2,
            message = "Price must have at most 8 integer and 2 decimal digits")
        BigDecimal price,
    @NotNull(message = "Stock is required") @Min(value = 0, message = "Stock cannot be negative")
        Integer stock,
    @Size(max = 500, message = "Image URL must not exceed 500 characters") String imageUrl) {}
