package com.gameshop.service.impl;

import com.gameshop.dto.request.CreateProductRequest;
import com.gameshop.dto.response.*;
import com.gameshop.entity.*;
import com.gameshop.exception.*;
import com.gameshop.projection.*;
import com.gameshop.repository.*;
import com.gameshop.service.ProductService;
import java.math.BigDecimal;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductServiceImpl implements ProductService {
  private final ProductRepository products;
  private final CategoryRepository categories;

  public ProductServiceImpl(ProductRepository products, CategoryRepository categories) {
    this.products = products;
    this.categories = categories;
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<ProductSummaryResponse> search(
      Long categoryId, String keyword, BigDecimal min, BigDecimal max, Pageable pageable) {
    if (min != null && max != null && min.compareTo(max) > 0) {
      throw new InvalidProductFilterException("Minimum price cannot exceed maximum price");
    }
    String q = keyword == null || keyword.isBlank() ? "" : keyword.trim();
    Page<ProductSummary> page = products.search(categoryId, q, min, max, pageable);
    return new PageResponse<>(
        page.getContent().stream()
            .map(
                p ->
                    new ProductSummaryResponse(
                        p.getId(),
                        p.getName(),
                        p.getPrice(),
                        p.getStock(),
                        p.getImageUrl(),
                        p.getCategoryId(),
                        p.getCategoryName()))
            .toList(),
        page.getNumber(),
        page.getSize(),
        page.getTotalElements(),
        page.getTotalPages());
  }

  @Override
  @Transactional(readOnly = true)
  public ProductResponse findById(Long id) {
    return detail(
        products.findActiveDetailById(id).orElseThrow(() -> new ProductNotFoundException(id)));
  }

  @Override
  @Transactional
  public ProductResponse create(CreateProductRequest r) {
    Category c = category(r.categoryId());
    return entity(
        products.save(
            new Product(c, r.name().trim(), r.description(), r.price(), r.stock(), r.imageUrl())));
  }

  @Override
  @Transactional
  public ProductResponse update(Long id, CreateProductRequest r) {
    Product p = products.findById(id).orElseThrow(() -> new ProductNotFoundException(id));
    p.update(
        category(r.categoryId()),
        r.name().trim(),
        r.description(),
        r.price(),
        r.stock(),
        r.imageUrl());
    return entity(p);
  }

  @Override
  @Transactional
  public void delete(Long id) {
    Product p = products.findById(id).orElseThrow(() -> new ProductNotFoundException(id));
    p.deactivate();
  }

  private Category category(Long id) {
    return categories.findById(id).orElseThrow(() -> new CategoryNotFoundException(id));
  }

  private ProductResponse detail(ProductDetail p) {
    return new ProductResponse(
        p.getId(),
        p.getName(),
        p.getDescription(),
        p.getPrice(),
        p.getStock(),
        p.getImageUrl(),
        p.getActive(),
        p.getCategoryId(),
        p.getCategoryName());
  }

  private ProductResponse entity(Product p) {
    return new ProductResponse(
        p.getId(),
        p.getName(),
        p.getDescription(),
        p.getPrice(),
        p.getStock(),
        p.getImageUrl(),
        p.isActive(),
        p.getCategory().getId(),
        p.getCategory().getName());
  }
}
