package com.gameshop.service.impl;

import com.gameshop.dto.response.DashboardResponse;
import com.gameshop.entity.OrderStatus;
import com.gameshop.repository.*;
import com.gameshop.service.DashboardService;
import java.util.EnumMap;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardServiceImpl implements DashboardService {
  private final ProductRepository products;
  private final OrderRepository orders;

  public DashboardServiceImpl(ProductRepository products, OrderRepository orders) {
    this.products = products;
    this.orders = orders;
  }

  @Override
  @Transactional(readOnly = true)
  public DashboardResponse stats() {
    EnumMap<OrderStatus, Long> counts = new EnumMap<>(OrderStatus.class);
    for (OrderStatus status : OrderStatus.values()) {
      counts.put(status, 0L);
    }
    orders.countGroupedByStatus().forEach(c -> counts.put(c.getStatus(), c.getCount()));
    return new DashboardResponse(products.countByActiveTrue(), orders.count(), counts);
  }
}
