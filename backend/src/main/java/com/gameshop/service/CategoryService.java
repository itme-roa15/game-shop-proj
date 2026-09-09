package com.gameshop.service;

import com.gameshop.dto.request.CategoryRequest;
import com.gameshop.dto.response.CategoryResponse;
import java.util.List;

public interface CategoryService {
  List<CategoryResponse> findAll();

  CategoryResponse create(CategoryRequest request);

  CategoryResponse rename(Long id, CategoryRequest request);
}
