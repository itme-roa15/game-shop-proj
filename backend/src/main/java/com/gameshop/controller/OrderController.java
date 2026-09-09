package com.gameshop.controller;

import com.gameshop.dto.request.*;
import com.gameshop.dto.response.*;
import com.gameshop.service.OrderService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
  private final OrderService service;

  public OrderController(OrderService service) {
    this.service = service;
  }

  @PostMapping
  @PreAuthorize("hasAnyRole('USER','ADMIN')")
  public ResponseEntity<ApiResponse<OrderResponse>> place(
      Principal principal, @Valid @RequestBody PlaceOrderRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.ok("Order placed", service.place(principal.getName(), request)));
  }

  @GetMapping("/me")
  @PreAuthorize("hasAnyRole('USER','ADMIN')")
  public ApiResponse<List<OrderResponse>> mine(Principal principal) {
    return ApiResponse.ok("Orders retrieved", service.mine(principal.getName()));
  }

  @GetMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ApiResponse<List<OrderResponse>> all() {
    return ApiResponse.ok("Orders retrieved", service.all());
  }

  @PatchMapping("/{id}/status")
  @PreAuthorize("hasRole('ADMIN')")
  public ApiResponse<OrderResponse> status(
      @PathVariable Long id, @Valid @RequestBody UpdateOrderStatusRequest request) {
    return ApiResponse.ok("Order status updated", service.updateStatus(id, request));
  }
}
