package com.gameshop.dto.response;

import java.math.BigDecimal;

public record ProductSummaryResponse(
    Long id,
    String name,
    BigDecimal price,
    Integer stock,
    String imageUrl,
    Long categoryId,
    String categoryName) {}
