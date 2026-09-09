package com.gameshop.service;

import com.gameshop.dto.request.CreateProductRequest;
import com.gameshop.dto.response.*;
import java.math.BigDecimal;
import org.springframework.data.domain.Pageable;

public interface ProductService {
  PageResponse<ProductSummaryResponse> search(
      Long categoryId, String keyword, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);

  ProductResponse findById(Long id);

  ProductResponse create(CreateProductRequest request);

  ProductResponse update(Long id, CreateProductRequest request);

  void delete(Long id);
}
