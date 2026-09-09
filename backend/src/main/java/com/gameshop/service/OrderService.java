package com.gameshop.service;

import com.gameshop.dto.request.*;
import com.gameshop.dto.response.OrderResponse;
import java.util.List;

public interface OrderService {
  OrderResponse place(String email, PlaceOrderRequest request);

  List<OrderResponse> mine(String email);

  List<OrderResponse> all();

  OrderResponse updateStatus(Long id, UpdateOrderStatusRequest request);
}
