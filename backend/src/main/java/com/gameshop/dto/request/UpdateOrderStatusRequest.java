package com.gameshop.dto.request;

import com.gameshop.entity.OrderStatus;
import jakarta.validation.constraints.*;

public record UpdateOrderStatusRequest(
    @NotNull(message = "Order status is required") OrderStatus status) {}
