package com.gameshop.service.impl;

import com.gameshop.dto.request.*;
import com.gameshop.dto.response.*;
import com.gameshop.entity.*;
import com.gameshop.exception.*;
import com.gameshop.projection.OrderRow;
import com.gameshop.repository.*;
import com.gameshop.service.OrderService;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderServiceImpl implements OrderService {
  private final OrderRepository orders;
  private final ProductRepository products;
  private final UserRepository users;

  public OrderServiceImpl(
      OrderRepository orders, ProductRepository products, UserRepository users) {
    this.orders = orders;
    this.products = products;
    this.users = users;
  }

  @Override
  @Transactional
  public OrderResponse place(String email, PlaceOrderRequest request) {
    User user =
        users
            .findByEmailIgnoreCase(email)
            .orElseThrow(() -> new AuthException("Authenticated user no longer exists"));
    Map<Long, Integer> quantities = new LinkedHashMap<>();
    request.items().forEach(i -> quantities.merge(i.productId(), i.quantity(), Integer::sum));
    Order order = new Order(user);
    quantities.forEach(
        (id, quantity) -> {
          Product p =
              products.findByIdForUpdate(id).orElseThrow(() -> new ProductNotFoundException(id));
          if (!p.isActive()) {
            throw new ProductNotFoundException(id);
          }
          if (p.getStock() < quantity) {
            throw new InsufficientStockException(p.getName(), p.getStock(), quantity);
          }
          p.deductStock(quantity);
          order.addItem(p, quantity, p.getPrice());
        });
    Order saved = orders.save(order);
    return fromEntity(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public List<OrderResponse> mine(String email) {
    User user =
        users
            .findByEmailIgnoreCase(email)
            .orElseThrow(() -> new AuthException("Authenticated user no longer exists"));
    return mapRows(orders.findRowsByUserId(user.getId()));
  }

  @Override
  @Transactional(readOnly = true)
  public List<OrderResponse> all() {
    return mapRows(orders.findAllRows());
  }

  @Override
  @Transactional
  public OrderResponse updateStatus(Long id, UpdateOrderStatusRequest request) {
    Order o = orders.findById(id).orElseThrow(() -> new OrderNotFoundException(id));
    o.setStatus(request.status());
    orders.flush();
    return mapRows(orders.findRowsByOrderId(id)).getFirst();
  }

  private List<OrderResponse> mapRows(List<OrderRow> rows) {
    Map<Long, List<OrderRow>> grouped =
        rows.stream()
            .collect(
                Collectors.groupingBy(
                    OrderRow::getOrderId, LinkedHashMap::new, Collectors.toList()));
    return grouped.values().stream()
        .map(
            group -> {
              OrderRow h = group.getFirst();
              List<OrderItemResponse> items =
                  group.stream()
                      .map(
                          r ->
                              new OrderItemResponse(
                                  r.getProductId(),
                                  r.getProductName(),
                                  r.getQuantity(),
                                  r.getUnitPrice(),
                                  r.getUnitPrice().multiply(BigDecimal.valueOf(r.getQuantity()))))
                      .toList();
              return new OrderResponse(
                  h.getOrderId(),
                  h.getUserId(),
                  h.getUserName(),
                  h.getUserEmail(),
                  h.getStatus(),
                  h.getTotal(),
                  h.getCreatedAt(),
                  items);
            })
        .toList();
  }

  private OrderResponse fromEntity(Order o) {
    List<OrderItemResponse> items =
        o.getItems().stream()
            .map(
                i ->
                    new OrderItemResponse(
                        i.getProduct().getId(),
                        i.getProduct().getName(),
                        i.getQuantity(),
                        i.getUnitPrice(),
                        i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity()))))
            .toList();
    return new OrderResponse(
        o.getId(),
        o.getUser().getId(),
        o.getUser().getName(),
        o.getUser().getEmail(),
        o.getStatus(),
        o.getTotal(),
        o.getCreatedAt(),
        items);
  }
}
