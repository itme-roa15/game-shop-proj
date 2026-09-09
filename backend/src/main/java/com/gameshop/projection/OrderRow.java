package com.gameshop.projection;

import com.gameshop.entity.OrderStatus;
import java.math.BigDecimal;
import java.time.Instant;

public interface OrderRow {
  Long getOrderId();

  Long getUserId();

  String getUserName();

  String getUserEmail();

  OrderStatus getStatus();

  BigDecimal getTotal();

  Instant getCreatedAt();

  Long getProductId();

  String getProductName();

  Integer getQuantity();

  BigDecimal getUnitPrice();
}
