package com.gameshop.dto.response;

import com.gameshop.entity.OrderStatus;
import java.util.Map;

public record DashboardResponse(
    long totalProducts, long totalOrders, Map<OrderStatus, Long> ordersByStatus) {}
