package com.gameshop.controller;

import com.gameshop.dto.request.CategoryRequest;
import com.gameshop.dto.response.*;
import com.gameshop.service.CategoryService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
  private final CategoryService service;

  public CategoryController(CategoryService service) {
    this.service = service;
  }

  @GetMapping
  public ApiResponse<List<CategoryResponse>> all() {
    return ApiResponse.ok("Categories retrieved", service.findAll());
  }

  @PostMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<CategoryResponse>> create(
      @Valid @RequestBody CategoryRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.ok("Category created", service.create(request)));
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ApiResponse<CategoryResponse> rename(
      @PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
    return ApiResponse.ok("Category renamed", service.rename(id, request));
  }
}
