package com.gameshop.controller;

import com.gameshop.dto.request.CreateProductRequest;
import com.gameshop.dto.response.*;
import com.gameshop.service.ProductService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
@Validated
public class ProductController {
  private final ProductService service;

  public ProductController(ProductService service) {
    this.service = service;
  }

  @GetMapping
  public ApiResponse<PageResponse<ProductSummaryResponse>> search(
      @RequestParam(required = false) Long categoryId,
      @RequestParam(required = false) String keyword,
      @RequestParam(required = false)
          @DecimalMin(value = "0.0", message = "Minimum price cannot be negative")
          BigDecimal minPrice,
      @RequestParam(required = false)
          @DecimalMin(value = "0.0", message = "Maximum price cannot be negative")
          BigDecimal maxPrice,
      @RequestParam(defaultValue = "0") @Min(value = 0, message = "Page cannot be negative")
          int page,
      @RequestParam(defaultValue = "20")
          @Min(value = 1, message = "Page size must be at least 1")
          @Max(value = 100, message = "Page size cannot exceed 100")
          int size) {
    return ApiResponse.ok(
        "Products retrieved",
        service.search(
            categoryId,
            keyword,
            minPrice,
            maxPrice,
            PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))));
  }

  @GetMapping("/{id}")
  public ApiResponse<ProductResponse> one(@PathVariable Long id) {
    return ApiResponse.ok("Product retrieved", service.findById(id));
  }

  @PostMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<ProductResponse>> create(
      @Valid @RequestBody CreateProductRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.ok("Product created", service.create(request)));
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ApiResponse<ProductResponse> update(
      @PathVariable Long id, @Valid @RequestBody CreateProductRequest request) {
    return ApiResponse.ok("Product updated", service.update(id, request));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ApiResponse<Void> delete(@PathVariable Long id) {
    service.delete(id);
    return ApiResponse.ok("Product deleted", null);
  }
}
