package com.gameshop.dto.response;

import com.gameshop.entity.OrderStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
    Long id,
    Long userId,
    String userName,
    String userEmail,
    OrderStatus status,
    BigDecimal total,
    Instant createdAt,
    List<OrderItemResponse> items) {}
